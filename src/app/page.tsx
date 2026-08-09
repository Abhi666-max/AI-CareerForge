"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Navbar             from "@/components/Navbar";
import ResumeDropzone     from "@/components/ResumeDropzone";
import MicroInterview     from "@/components/MicroInterview";
import AuraDashboard      from "@/components/AuraDashboard";
import HowItWorksSection  from "@/components/HowItWorksSection";
import FeaturesSection    from "@/components/FeaturesSection";
import { db }             from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export type AppPhase = "upload" | "interview" | "dashboard";

const pageVariants = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3,  ease: "easeIn"  as const } },
} as const;

// ── Error Toast ───────────────────────────────────────────────────────────────
function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm shadow-2xl"
      style={{
        background: "rgba(10,10,15,0.97)",
        border: "1px solid rgba(244,63,94,0.4)",
        backdropFilter: "blur(16px)",
        maxWidth: "90vw",
      }}
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#f43f5e" }} />
      <span style={{ color: "var(--text-primary)" }}>{message}</span>
      <button onClick={onClose} className="ml-2 text-lg leading-none opacity-40 hover:opacity-100 transition-opacity">×</button>
    </motion.div>
  );
}

// ── Analyzing Skeleton ────────────────────────────────────────────────────────
function AnalyzingLoader() {
  const steps = [
    "Parsing PDF with pdf-parse…",
    "Sending to Google Gemini 1.5 Flash…",
    "Scoring 4 pillars…",
    "Building your Aura Dashboard…",
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2200);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] gap-8 px-4">
      {/* Spinner */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin" />
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", animation: "pulse 2s ease infinite" }}
        />
      </div>

      {/* Step label */}
      <div className="text-center space-y-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Gemini + Groq pipeline · Usually completes in 8–12 seconds
        </p>
      </div>

      {/* Skeleton bars */}
      <div className="w-full max-w-sm space-y-3">
        {[85, 65, 90, 55].map((w, i) => (
          <motion.div
            key={i}
            className="h-2.5 rounded-full"
            style={{ width: `${w}%`, margin: "0 auto", background: "rgba(99,102,241,0.12)" }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [phase, setPhase]             = useState<AppPhase>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);

  const handleFileAccepted   = (file: File) => setUploadedFile(file);
  const handleStartInterview = () => setPhase("interview");

  const handleInterviewDone = async (transcription?: string) => {
    setPhase("dashboard");
    setDashboardData(null);
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      if (!uploadedFile) throw new Error("No resume found. Please go back and upload your PDF.");

      const formData = new FormData();
      formData.append("resume", uploadedFile);
      if (transcription) formData.append("transcription", transcription);

      const res  = await fetch("/api/analyze", { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok || !body.success) throw new Error(body.error || `Server error (${res.status})`);

      setDashboardData(body.data);

      // Persist (truly non-blocking to prevent UI hangs if Firestore is offline/unreachable)
      addDoc(collection(db, "reports"), {
        createdAt: new Date(),
        data:      body.data,
        fileName:  uploadedFile.name,
      }).catch(err => console.warn("Firebase save skipped:", err));
      
    } catch (err: any) {
      setErrorMsg(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartOver = () => {
    setPhase("upload");
    setUploadedFile(null);
    setDashboardData(null);
    setErrorMsg(null);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">

          {/* ── PHASE 1: Landing ── */}
          {phase === "upload" && (
            <motion.div
              key="upload"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col items-center"
            >
              {/* ── 2-Column Hero ── */}
              <section
                id="upload-section"
                className="w-full max-w-7xl mx-auto px-6 pt-16 pb-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                  {/* Left — compact copy */}
                  <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55 }}
                    className="flex flex-col gap-6"
                  >
                    {/* Badge */}
                    <div
                      className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-semibold tracking-widest uppercase"
                      style={{ color: "var(--accent-primary)", borderColor: "var(--border-glow)" }}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      AI-Powered Interview Readiness
                    </div>

                    {/* Headline — compact */}
                    <div>
                      <h1
                        className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        Know Your{" "}
                        <span className="gradient-text">Aura Score</span>
                        <br />
                        Before the Interview
                      </h1>
                    </div>

                    {/* Subtitle */}
                    <p
                      className="text-base sm:text-lg leading-relaxed max-w-md"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Upload your resume. Answer one targeted question. Get your personalised
                      interview readiness breakdown — all in under{" "}
                      <strong style={{ color: "var(--text-primary)" }}>2 minutes</strong>.
                    </p>

                    {/* Trust strip */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      {[
                        "Powered by Google Gemini",
                        "Groq Llama 3",
                        "No account required",
                        "Results in < 2 min",
                      ].map((t) => (
                        <span key={t} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70" />
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Social proof pill */}
                    <div
                      className="inline-flex w-fit items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium"
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        color: "#10b981",
                      }}
                    >
                      <span className="text-base">⚡</span>
                      Average time-to-dashboard: <strong className="ml-1">9.3 seconds</strong>
                    </div>
                  </motion.div>

                  {/* Right — dropzone */}
                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                  >
                    <ResumeDropzone
                      onFileAccepted={handleFileAccepted}
                      onStartInterview={handleStartInterview}
                      uploadedFile={uploadedFile}
                    />
                  </motion.div>
                </div>
              </section>

              {/* ── Divider ── */}
              <div className="w-full max-w-6xl mx-auto px-4 mt-8">
                <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }} />
              </div>

              {/* ── Sections ── */}
              <HowItWorksSection />

              <div className="w-full max-w-6xl mx-auto px-4">
                <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)" }} />
              </div>

              <FeaturesSection />
            </motion.div>
          )}

          {/* ── PHASE 2: Interview ── */}
          {phase === "interview" && (
            <motion.section
              key="interview"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex flex-col items-center px-4 pt-12 pb-20"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-3 text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#f43f5e", borderColor: "rgba(244,63,94,0.3)" }}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Focus Mode — Micro Interview
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  You have{" "}
                  <strong style={{ color: "var(--text-secondary)" }}>30 seconds</strong>{" "}
                  to answer. Think <strong style={{ color: "var(--text-secondary)" }}>STAR method</strong>.
                </p>
              </motion.div>

              <MicroInterview uploadedFile={uploadedFile} onComplete={handleInterviewDone} />

              {/* Back button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={handleStartOver}
                className="mt-8 flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg transition-all"
                style={{ color: "var(--text-muted)", background: "rgba(71,85,105,0.1)", border: "1px solid rgba(71,85,105,0.2)" }}
              >
                <RotateCcw className="w-3 h-3" /> Back to upload
              </motion.button>
            </motion.section>
          )}

          {/* ── PHASE 3: Dashboard ── */}
          {phase === "dashboard" && (
            <motion.section
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full px-4 pt-10 pb-20"
            >
              {isAnalyzing ? (
                <AnalyzingLoader />
              ) : (
                <AuraDashboard data={dashboardData} onStartOver={handleStartOver} />
              )}
            </motion.section>
          )}

        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <footer
        className="w-full py-12 text-center border-t mt-auto"
        style={{ borderColor: "rgba(71,85,105,0.15)", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex flex-col items-center justify-center gap-5">
          <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
            Built by <span style={{ color: "var(--text-primary)" }}>Abhijeet Kangane</span>
            <span className="text-zinc-700 px-2">—</span>Founder
          </p>
          <div className="flex items-center gap-5">
            {[
              { href: "https://github.com/abhi666-max", label: "GitHub", d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4 M9 18c-4.51 2-5-2-7-2" },
              { href: "https://www.linkedin.com/in/abhijeet-kangane/", label: "LinkedIn", d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
              { href: "https://x.com/abhijeet_037", label: "X", d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
              { href: "https://www.instagram.com/abhijeet.037/", label: "Instagram", d: "M2 2h20v20H2z M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-zinc-600 hover:text-white transition-all duration-300 hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {s.d.split(" M").map((seg, i) => (
                    <path key={i} d={i === 0 ? seg : "M" + seg} />
                  ))}
                </svg>
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} AI CareerForge · Powered by Google Gemini & Groq
          </p>
        </div>
      </footer>

      {/* ── Error Toast ── */}
      <AnimatePresence>
        {errorMsg && <ErrorToast message={errorMsg} onClose={() => setErrorMsg(null)} />}
      </AnimatePresence>
    </main>
  );
}
