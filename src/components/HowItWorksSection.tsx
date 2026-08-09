"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Upload, Mic, BarChart3, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Upload,
    color: "#6366f1",
    gradient: "from-indigo-500/20 to-violet-500/10",
    title: "Drop Your Resume",
    desc: "Upload any PDF resume. Google Gemini reads your actual skills, projects, and experience — not just keywords — in seconds.",
  },
  {
    step: "02",
    icon: Mic,
    color: "#a78bfa",
    gradient: "from-violet-500/20 to-purple-500/10",
    title: "Answer One Question",
    desc: "Record a 30-second spoken response. Groq's Llama 3 model evaluates delivery, clarity, and STAR structure in real time.",
  },
  {
    step: "03",
    icon: BarChart3,
    color: "#10b981",
    gradient: "from-emerald-500/20 to-teal-500/10",
    title: "Get Your Aura Score",
    desc: "Receive a personalised readiness report across 4 pillars with ranked, actionable next steps — ready in under 2 minutes.",
  },
];

export default function HowItWorksSection() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" ref={ref} className="w-full max-w-6xl mx-auto px-4 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55 }}
        className="text-center mb-16"
      >
        <span
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5"
          style={{ color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
        >
          How it works
        </span>
        <h2
          className="text-3xl sm:text-4xl font-black tracking-tight mb-3"
          style={{ color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}
        >
          From upload to insights in{" "}
          <span className="gradient-text">under 2 minutes</span>
        </h2>
        <p className="text-base max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
          No forms. No scheduling. No waiting. Drop your resume and get an objective readiness breakdown instantly.
        </p>
      </motion.div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {/* Animated connector line on desktop */}
        <motion.div
          className="hidden md:block absolute top-11 left-[20%] right-[20%] h-px"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, rgba(99,102,241,0.5), rgba(167,139,250,0.5), rgba(16,185,129,0.5))",
            transformOrigin: "left",
          }}
        />

        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative glass-card p-7 flex flex-col gap-5 cursor-default group overflow-hidden"
              style={{ borderColor: `${s.color}22` }}
            >
              {/* Background gradient on hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Step badge */}
              <div className="relative z-10 flex items-center justify-between">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${s.color}18`,
                    border: `1px solid ${s.color}40`,
                    color: s.color,
                    boxShadow: `0 0 20px ${s.color}15`,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span
                  className="text-4xl font-black tabular-nums"
                  style={{ color: s.color, opacity: 0.12, fontFamily: "'Outfit', sans-serif" }}
                >
                  {s.step}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {s.desc}
                </p>
              </div>

              {/* Bottom accent line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${s.color}70, transparent)`,
                  transformOrigin: "left",
                }}
              />

              {/* Arrow connector (between cards, desktop) */}
              {i < STEPS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.7 + i * 0.15 }}
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full"
                  style={{ background: "rgba(9,9,11,0.9)", border: "1px solid rgba(71,85,105,0.3)" }}
                >
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8 }}
        className="text-center mt-12"
      >
        <a href="#upload-section" className="btn-glow inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold">
          Start My Analysis
          <ArrowRight className="w-4 h-4" />
        </a>
      </motion.div>
    </section>
  );
}
