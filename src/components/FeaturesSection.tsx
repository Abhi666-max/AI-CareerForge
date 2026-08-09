"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import {
  BrainCircuit, ShieldCheck, Zap, FileSearch, Mic2, BarChart3, ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: BrainCircuit,
    color: "#6366f1",
    shadow: "rgba(99,102,241,0.25)",
    title: "Gemini-Powered Resume Analysis",
    desc: "Google Gemini 1.5 Flash reads your resume semantically — scoring technical depth, project quality, and resume clarity in one pass.",
  },
  {
    icon: Mic2,
    color: "#a78bfa",
    shadow: "rgba(167,139,250,0.25)",
    title: "Real-Time Communication Scoring",
    desc: "Groq's Llama 3 transcribes and evaluates your live audio response in milliseconds — clarity, pacing, and STAR structure all measured.",
  },
  {
    icon: BarChart3,
    color: "#10b981",
    shadow: "rgba(16,185,129,0.25)",
    title: "4-Pillar Aura Score",
    desc: "One composite score across Technical, Portfolio, Resume Strength, and Communication — benchmarked against peer averages.",
  },
  {
    icon: FileSearch,
    color: "#22d3ee",
    shadow: "rgba(34,211,238,0.25)",
    title: "Personalised Feedback Cards",
    desc: "Every insight is unique to your resume. Feedback references your actual project names, technologies, and missing elements by name.",
  },
  {
    icon: Zap,
    color: "#f59e0b",
    shadow: "rgba(245,158,11,0.25)",
    title: "Under 2-Minute Total Flow",
    desc: "Upload → Record → Dashboard. The entire evaluation pipeline is optimised for speed. Combined API latency is typically under 8 seconds.",
  },
  {
    icon: ShieldCheck,
    color: "#f43f5e",
    shadow: "rgba(244,63,94,0.25)",
    title: "Zero Data Retention",
    desc: "Your PDF is processed in memory and discarded immediately. We never store raw resume text. Only anonymised score data is persisted.",
  },
];

// Stagger container
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
} as const;

export default function FeaturesSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="features" ref={ref} className="w-full max-w-6xl mx-auto px-4 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
        className="text-center mb-16"
      >
        <span
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5"
          style={{ color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}
        >
          Features
        </span>
        <h2
          className="text-3xl sm:text-4xl font-black tracking-tight mb-3"
          style={{ color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}
        >
          Everything you need to{" "}
          <span className="gradient-text">interview with confidence</span>
        </h2>
        <p className="text-base max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
          Built on frontier AI models. Designed for candidates who want honest, objective feedback — not vanity scores.
        </p>
      </motion.div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              variants={cardVariants}
              whileHover={{
                y: -6,
                boxShadow: `0 20px 60px ${f.shadow}`,
                borderColor: `${f.color}44`,
                transition: { duration: 0.25 },
              }}
              className="glass-card p-6 flex flex-col gap-4 cursor-default group relative overflow-hidden"
              style={{ borderColor: `${f.color}18` }}
            >
              {/* Radial glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${f.color}08 0%, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.15, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}40`,
                  color: f.color,
                }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>

              {/* Text */}
              <div className="relative z-10">
                <h3 className="text-sm font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {f.desc}
                </p>
              </div>

              {/* Hover bottom glow line */}
              <div
                className="h-0.5 rounded-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
                style={{ background: `linear-gradient(90deg, transparent, ${f.color}80, transparent)` }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.7 }}
        className="text-center mt-14"
      >
        <a href="#upload-section" className="btn-glow inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold">
          Analyse My Resume Now
          <ArrowRight className="w-4 h-4" />
        </a>
        <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
          Free · No account required · Results in under 2 minutes
        </p>
      </motion.div>
    </section>
  );
}
