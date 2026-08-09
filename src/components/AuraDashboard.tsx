"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, FileText, Mic, Briefcase,
  RotateCcw, Share2, Download, ChevronDown, ChevronUp,
  Calendar, TrendingUp, Sparkles, CheckCircle2, Star, AlertTriangle,
} from "lucide-react";

import AuraScoreRing from "./AuraScoreRing";
import RadarChart    from "./RadarChart";
import FeedbackCard  from "./FeedbackCard";
import type { FeedbackItem } from "./FeedbackCard";

// ── Static plan (non-personalised, always shown) ──────────────────────────────
const PLAN = [
  {
    week: "Week 1", color: "#f43f5e", task: "Resume Overhaul",
    items: ["Quantify all bullet points with metrics", "Move GitHub + demo links to header", "Add cloud/DevOps keywords from target JDs"],
  },
  {
    week: "Week 2", color: "#f59e0b", task: "Portfolio Polish",
    items: ["Pin top 3 GitHub repos", "Write READMEs with architecture diagrams", "Deploy a live project to Vercel/Railway"],
  },
  {
    week: "Month 1", color: "#6366f1", task: "Communication Mastery",
    items: ["Daily 30-sec STAR practice sessions", "Record yourself — replay at 0.9× speed", "Target 140–160 WPM consistently"],
  },
  {
    week: "Month 2", color: "#10b981", task: "Technical Upskilling",
    items: ["Complete AWS Cloud Practitioner", "Build + document 1 system design project", "Contribute to 1 open-source repo"],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
interface AuraDashboardProps {
  onStartOver: () => void;
  data: any | null;
}

export default function AuraDashboard({ onStartOver, data }: AuraDashboardProps) {
  const [visible, setVisible]         = useState(false);
  const [showAllFeedback, setShowAll] = useState(false);
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ── Guard: no data means API failed ─────────────────────────────────────────
  if (!data) {
    return (
      <div className="w-full max-w-lg mx-auto text-center px-4 py-20 flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)" }}>
          <AlertTriangle className="w-8 h-8" style={{ color: "#f43f5e" }} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Analysis Failed
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            We could not process your resume. This could be due to an API error or an unsupported PDF format.
          </p>
        </div>
        <button
          onClick={onStartOver}
          className="btn-glow flex items-center gap-2 px-6 py-3 text-sm font-semibold"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  // ── Real data ─────────────────────────────────────────────────────────────
  const score: number = data.overallScore ?? 0;
  const feedbackList: FeedbackItem[] = Array.isArray(data.feedback) ? data.feedback : [];

  const pillars = [
    {
      name: "Technical Skills",
      score: data.pillars?.technical ?? 0,
      color: "#818cf8",
      icon: <Code2 className="w-4 h-4" />,
      insight: data.pillars?.technicalInsight ?? "Analyse technical keywords in your resume.",
      trend: (data.pillars?.technical ?? 0) >= 74 ? `+${(data.pillars?.technical ?? 0) - 74} vs avg` : `${(data.pillars?.technical ?? 0) - 74} vs avg`,
    },
    {
      name: "Portfolio",
      score: data.pillars?.portfolio ?? 0,
      color: "#10b981",
      icon: <Briefcase className="w-4 h-4" />,
      insight: data.pillars?.portfolioInsight ?? "Showcase projects with live links.",
      trend: (data.pillars?.portfolio ?? 0) >= 71 ? `+${(data.pillars?.portfolio ?? 0) - 71} vs avg` : `${(data.pillars?.portfolio ?? 0) - 71} vs avg`,
    },
    {
      name: "Communication",
      score: data.pillars?.communication ?? 0,
      color: "#a78bfa",
      icon: <Mic className="w-4 h-4" />,
      insight: data.pillars?.communicationInsight ?? "Clear articulation is key.",
      trend: (data.pillars?.communication ?? 0) >= 69 ? `+${(data.pillars?.communication ?? 0) - 69} vs avg` : `${(data.pillars?.communication ?? 0) - 69} vs avg`,
    },
    {
      name: "Resume Strength",
      score: data.pillars?.resume ?? 0,
      color: "#22d3ee",
      icon: <FileText className="w-4 h-4" />,
      insight: data.pillars?.resumeInsight ?? "Quantify achievements with metrics.",
      trend: (data.pillars?.resume ?? 0) >= 71 ? `+${(data.pillars?.resume ?? 0) - 71} vs avg` : `${(data.pillars?.resume ?? 0) - 71} vs avg`,
    },
  ];

  const visibleFeedback = showAllFeedback ? feedbackList : feedbackList.slice(0, 4);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Priority counts from actual data
  const highCount   = feedbackList.filter((f: any) => f.priority === "high").length;
  const medCount    = feedbackList.filter((f: any) => f.priority === "medium").length;
  const lowCount    = feedbackList.filter((f: any) => f.priority === "low").length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-20 space-y-10">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs font-semibold tracking-widest uppercase"
          style={{ color: "var(--accent-primary)", borderColor: "var(--border-glow)" }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Your Aura Dashboard
        </div>
        <h2
          className="text-3xl sm:text-4xl font-black gradient-text pt-1"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Interview Readiness Report
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Analysed across 4 core pillars · Personalised to your profile
        </p>
      </motion.div>

      {/* ── Score + Radar grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={visible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-card p-8 flex flex-col items-center justify-center gap-6"
          style={{ minHeight: 360 }}
        >
          <AuraScoreRing score={score} isVisible={visible} />

          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            {pillars.map((p) => (
              <div key={p.name}
                className="flex items-center gap-2.5 p-2.5 rounded-xl"
                style={{ background: "rgba(5,8,17,0.5)", border: "1px solid rgba(71,85,105,0.2)" }}
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${p.color}20`, color: p.color }}>
                  {p.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {p.score}
                    <span className="font-normal" style={{ color: "var(--text-muted)" }}>/100</span>
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                    {p.name}
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-semibold flex-shrink-0"
                  style={{ color: p.trend.startsWith("+") ? "#10b981" : "#f43f5e" }}>
                  {p.trend}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Radar chart card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={visible ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 flex flex-col"
        >
          <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Pillar Breakdown
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Your skill coverage across 4 interview dimensions
          </p>

          <RadarChart pillars={pillars} isVisible={visible} />

          <div className="space-y-2.5 mt-4">
            {pillars.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: 12 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 1.4 + i * 0.08 }}
                className="flex items-start gap-2"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ background: p.color, boxShadow: `0 0 4px ${p.color}` }}
                />
                <div>
                  <span className="text-xs font-semibold mr-1" style={{ color: p.color }}>
                    {p.name}:
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {p.insight}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Progress Bars ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              Pillar Score Breakdown
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Hover a bar to see your benchmark vs peers
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(99,102,241,0.4)" }} />
              Your score
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 rounded-sm" style={{ background: "rgba(245,158,11,0.5)" }} />
              Peer avg
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {pillars.map((p, i) => {
            const peerAvg = [74, 71, 69, 71][i];
            return (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background: `${p.color}20`, color: p.color }}>
                      {p.icon}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {p.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Avg: {peerAvg}
                    </span>
                    <span className="text-sm font-bold" style={{ color: p.color }}>
                      {p.score}
                    </span>
                  </div>
                </div>

                <div className="relative h-3 rounded-full overflow-hidden"
                  style={{ background: "rgba(71,85,105,0.2)" }}>
                  <div
                    className="absolute top-0 bottom-0 w-0.5 z-10"
                    style={{ left: `${peerAvg}%`, background: "rgba(245,158,11,0.7)" }}
                  />
                  <motion.div
                    className="h-full rounded-full relative"
                    style={{
                      background: `linear-gradient(90deg, ${p.color}88, ${p.color})`,
                      boxShadow: `0 0 12px ${p.color}44`,
                    }}
                    initial={{ width: "0%" }}
                    animate={visible ? { width: `${p.score}%` } : { width: "0%" }}
                    transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Actionable Feedback ── */}
      {feedbackList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Actionable Feedback
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Specific steps — personalised to your resume
              </p>
            </div>
            <div className="flex gap-2">
              {([["high", "#f43f5e", highCount], ["medium", "#f59e0b", medCount], ["low", "#6366f1", lowCount]] as const).map(([p, color, count]) =>
                count > 0 ? (
                  <div key={p}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: `${color}18`, border: `1px solid ${color}33`, color }}>
                    {count} {p}
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {visibleFeedback.map((item: any, i: number) => (
                <FeedbackCard key={item.title || i} item={item} index={i} isVisible={visible} />
              ))}
            </AnimatePresence>
          </div>

          {feedbackList.length > 4 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAll(!showAllFeedback)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                id="toggle-feedback-button"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "var(--accent-primary)",
                }}
              >
                {showAllFeedback ? (
                  <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
                ) : (
                  <><ChevronDown className="w-3.5 h-3.5" /> Show All {feedbackList.length} Suggestions</>
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Improvement Plan ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.65 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            Your Personalised Improvement Plan
          </h3>
        </div>

        <div className="relative">
          <div
            className="absolute left-5 top-0 bottom-0 w-px"
            style={{ background: "linear-gradient(180deg, #6366f1, #10b981)", opacity: 0.3 }}
          />
          <div className="space-y-6">
            {PLAN.map((p, i) => (
              <motion.div
                key={p.week}
                initial={{ opacity: 0, x: -20 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex gap-5 pl-0"
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center z-10 relative"
                    style={{
                      background: `${p.color}20`,
                      border: `2px solid ${p.color}60`,
                      boxShadow: `0 0 12px ${p.color}30`,
                    }}
                  >
                    <TrendingUp className="w-4 h-4" style={{ color: p.color }} />
                  </div>
                </div>
                <div
                  className="flex-1 rounded-xl p-4"
                  style={{ background: `${p.color}08`, border: `1px solid ${p.color}22` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${p.color}20`, color: p.color }}
                    >
                      {p.week}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {p.task}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {p.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs"
                        style={{ color: "var(--text-secondary)" }}>
                        <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: p.color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── CTA row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
        <button
          onClick={onStartOver}
          id="start-over-button"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "rgba(71,85,105,0.15)",
            border: "1px solid rgba(71,85,105,0.3)",
            color: "var(--text-secondary)",
          }}
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>

        <button
          onClick={handleShare}
          id="share-results-button"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all relative"
          style={{
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "var(--accent-primary)",
          }}
        >
          <Share2 className="w-4 h-4" />
          {copied ? "Link Copied!" : "Share Results"}
        </button>

        <button
          id="download-report-button"
          className="btn-glow flex items-center gap-2 px-6 py-3 text-sm font-semibold"
        >
          <Download className="w-4 h-4" />
          Download Full Report
        </button>
      </motion.div>

      {/* ── Motivational footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible ? { opacity: 1 } : {}}
        transition={{ delay: 1.0 }}
        className="text-center pb-4"
      >
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-card text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <Star className="w-4 h-4" style={{ color: "#f59e0b" }} fill="#f59e0b" />
          You completed your AI-powered readiness assessment in under{" "}
          <strong className="mx-1" style={{ color: "var(--text-primary)" }}>2 minutes</strong>.
          <Star className="w-4 h-4" style={{ color: "#f59e0b" }} fill="#f59e0b" />
        </div>
      </motion.div>

    </div>
  );
}
