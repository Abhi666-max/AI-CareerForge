"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  FileCheck,
} from "lucide-react";

interface ResumeDropzoneProps {
  onFileAccepted: (file: File) => void;
  onStartInterview: () => void;
  uploadedFile: File | null;
}

type DropState = "idle" | "hover" | "uploading" | "success" | "error";

const PARTICLES = [
  { size: 4, x: "15%", y: "20%", dur: "7s", delay: "0s",  color: "#6366f1" },
  { size: 3, x: "80%", y: "15%", dur: "9s", delay: "1s",  color: "#7c3aed" },
  { size: 5, x: "70%", y: "75%", dur: "6s", delay: "2s",  color: "#22d3ee" },
  { size: 3, x: "25%", y: "80%", dur: "8s", delay: "0.5s",color: "#6366f1" },
  { size: 4, x: "90%", y: "50%", dur: "7.5s",delay:"1.5s",color: "#a78bfa" },
  { size: 2, x: "10%", y: "55%", dur: "10s", delay:"3s", color: "#38bdf8" },
];

export default function ResumeDropzone({ onFileAccepted, onStartInterview, uploadedFile }: ResumeDropzoneProps) {
  const [dropState, setDropState] = useState<DropState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulateUpload = useCallback(
    (file: File) => {
      setDropState("uploading");
      setProgress(0);

      let p = 0;
      progressRef.current = setInterval(() => {
        p += Math.random() * 18 + 5;
        if (p >= 100) {
          p = 100;
          clearInterval(progressRef.current!);
          setProgress(100);
          setTimeout(() => {
            setDropState("success");
            onFileAccepted(file);
          }, 400);
        }
        setProgress(Math.min(p, 100));
      }, 120);
    },
    [onFileAccepted]
  );

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setErrorMsg("");
      if (rejected.length > 0) {
        const code = rejected[0].errors[0].code;
        if (code === "file-too-large")
          setErrorMsg("File exceeds 10 MB limit. Please compress your resume.");
        else if (code === "file-invalid-type")
          setErrorMsg("Only PDF files are accepted.");
        else setErrorMsg("This file cannot be uploaded.");
        setDropState("error");
        return;
      }
      if (accepted.length > 0) simulateUpload(accepted[0]);
    },
    [simulateUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
      onDragEnter: () => setDropState("hover"),
      onDragLeave: () => setDropState("idle"),
    });

  const handleReset = () => {
    setDropState("idle");
    setProgress(0);
    setErrorMsg("");
    clearInterval(progressRef.current!);
  };

  const dropzoneCls =
    dropState === "uploading" || dropState === "success"
      ? ""
      : isDragAccept
      ? "dropzone-accept"
      : isDragReject
      ? "dropzone-reject"
      : isDragActive || dropState === "hover"
      ? "dropzone-active"
      : dropState === "error"
      ? "dropzone-reject"
      : "dropzone-idle";

  return (
    <div className="glass-card p-1 relative overflow-hidden" id="resume-dropzone-container">
      {/* Inner gradient border shimmer when idle */}
      {dropState === "idle" && (
        <div className="absolute inset-0 rounded-[20px] pointer-events-none shimmer opacity-50" />
      )}

      <div
        {...getRootProps()}
        className={`relative rounded-[16px] cursor-pointer transition-all duration-300 ${dropzoneCls}`}
        style={{ minHeight: "280px" }}
        id="resume-dropzone"
        aria-label="Resume upload dropzone"
      >
        <motion.div
          className="absolute inset-0 rounded-[16px]"
          whileHover={{ scale: 1.02 }}
          animate={
            isDragActive || dropState === "hover"
              ? { scale: 1.02, boxShadow: "0px 0px 30px rgba(99, 102, 241, 0.3)" }
              : { scale: 1, boxShadow: "0px 0px 0px rgba(99, 102, 241, 0)" }
          }
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ zIndex: 0 }}
        />
        <input {...getInputProps()} id="resume-file-input" aria-label="Upload PDF resume" />

        {/* Floating particles (visible in idle/hover) */}
        {(dropState === "idle" || dropState === "hover") &&
          PARTICLES.map((p, i) => (
            <div
              key={i}
              className="particle"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
                background: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                "--dur": p.dur,
                "--delay": p.delay,
              } as React.CSSProperties}
            />
          ))}

        {/* ── IDLE / HOVER STATE ── */}
        <AnimatePresence mode="wait">
          {(dropState === "idle" || dropState === "hover" || dropState === "error") && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-5 p-10 h-full min-h-[280px]"
            >
              {/* Icon area */}
              <div className="relative">
                <motion.div
                  animate={isDragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: isDragAccept
                      ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))"
                      : isDragReject || dropState === "error"
                      ? "linear-gradient(135deg, rgba(244,63,94,0.2), rgba(225,29,72,0.1))"
                      : "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(124,58,237,0.1))",
                    border: "1px solid",
                    borderColor: isDragAccept
                      ? "rgba(16,185,129,0.4)"
                      : isDragReject || dropState === "error"
                      ? "rgba(244,63,94,0.4)"
                      : "rgba(99,102,241,0.4)",
                    boxShadow: isDragActive
                      ? isDragAccept
                        ? "0 0 30px rgba(16,185,129,0.3)"
                        : "0 0 30px rgba(99,102,241,0.3)"
                      : "none",
                  }}
                >
                  {isDragReject || dropState === "error" ? (
                    <AlertCircle className="w-8 h-8" style={{ color: "var(--accent-rose)" }} />
                  ) : isDragAccept ? (
                    <FileCheck className="w-8 h-8" style={{ color: "var(--accent-emerald)" }} />
                  ) : (
                    <FileText className="w-8 h-8" style={{ color: "var(--accent-primary)" }} />
                  )}
                </motion.div>

                {/* Sparkle orbit */}
                {!isDragActive && dropState !== "error" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-3 rounded-full"
                    style={{ border: "1px dashed rgba(99,102,241,0.25)" }}
                  >
                    <Sparkles
                      className="w-3 h-3 absolute -top-1.5 left-1/2 -translate-x-1/2"
                      style={{ color: "var(--accent-primary)" }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                {dropState === "error" ? (
                  <>
                    <p className="text-lg font-semibold" style={{ color: "var(--accent-rose)" }}>
                      Upload Failed
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {errorMsg}
                    </p>
                  </>
                ) : isDragActive ? (
                  <p className="text-lg font-semibold gradient-text">
                    {isDragAccept ? "Drop to upload your resume!" : "Only PDF files accepted"}
                  </p>
                ) : (
                  <>
                    <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                      Drop your resume here
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      or{" "}
                      <span
                        className="font-semibold underline underline-offset-2 cursor-pointer"
                        style={{ color: "var(--accent-primary)" }}
                      >
                        click to browse files
                      </span>
                    </p>
                  </>
                )}
              </div>

              {/* Upload button (idle only) */}
              {dropState !== "error" && (
                <button
                  className="btn-glow px-6 py-2.5 text-sm flex items-center gap-2 mt-1"
                  id="upload-browse-button"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Upload className="w-4 h-4" />
                  Upload PDF Resume
                </button>
              )}

              {/* Retry button (error) */}
              {dropState === "error" && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="px-5 py-2 text-sm rounded-xl font-semibold transition-all"
                  id="retry-upload-button"
                  style={{
                    background: "rgba(244,63,94,0.15)",
                    border: "1px solid rgba(244,63,94,0.4)",
                    color: "var(--accent-rose)",
                  }}
                >
                  Try Again
                </button>
              )}

              {/* Format hint */}
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                PDF only · Max 10 MB · ATS-optimised recommended
              </p>
            </motion.div>
          )}

          {/* ── UPLOADING STATE ── */}
          {dropState === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6 p-10 min-h-[280px]"
            >
              {/* Scanning animation */}
              <div
                className="relative w-28 h-36 rounded-xl overflow-hidden"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                {/* Document lines */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-3 right-3 h-1.5 rounded-full shimmer"
                    style={{
                      top: `${20 + i * 16}%`,
                      opacity: 0.5 + i * 0.05,
                      width: i === 4 ? "55%" : undefined,
                    }}
                  />
                ))}
                {/* Scan beam */}
                <div
                  className="scan-line absolute left-0 right-0 h-6"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent, rgba(99,102,241,0.4), transparent)",
                  }}
                />
                {/* AI eye icon */}
                <div className="absolute bottom-3 right-3">
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    style={{ color: "var(--accent-primary)" }}
                  />
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Analysing your resume…
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Extracting skills, experience & portfolio signals
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
                  <span>AI Parsing</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(71,85,105,0.3)" }}>
                  <motion.div
                    className="progress-bar h-full rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS STATE ── */}
          {dropState === "success" && uploadedFile && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex flex-col items-center justify-center gap-5 p-10 min-h-[280px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="relative"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))",
                    border: "2px solid rgba(16,185,129,0.5)",
                    boxShadow: "0 0 40px rgba(16,185,129,0.25)",
                  }}
                >
                  <CheckCircle2 className="w-10 h-10" style={{ color: "var(--accent-emerald)" }} />
                </div>
                <div
                  className="absolute inset-0 rounded-full pulse-ring"
                  style={{ border: "2px solid rgba(16,185,129,0.3)" }}
                />
              </motion.div>

              <div className="text-center space-y-1">
                <p className="text-lg font-semibold" style={{ color: "var(--accent-emerald)" }}>
                  Resume Uploaded Successfully!
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  AI has parsed your profile. Get ready for your micro-interview.
                </p>
              </div>

              {/* File info chip */}
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent-emerald)" }} />
                <div className="text-left">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {uploadedFile.name.length > 32
                      ? uploadedFile.name.slice(0, 29) + "…"
                      : uploadedFile.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {(uploadedFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="ml-2 p-1 rounded-full hover:bg-rose-500/20 transition-colors"
                  id="remove-file-button"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              {/* CTA to next phase */}
              <button
                className="btn-glow px-8 py-3 text-sm font-semibold flex items-center gap-2"
                id="start-interview-button"
                onClick={(e) => { e.stopPropagation(); onStartInterview(); }}
              >
                <Sparkles className="w-4 h-4" />
                Start Micro-Interview →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
