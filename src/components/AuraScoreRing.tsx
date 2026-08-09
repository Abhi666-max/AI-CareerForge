"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AuraScoreRingProps {
  score: number;      // 0-100
  isVisible: boolean;
}

const SIZE   = 220;
const STROKE = 14;
const R      = (SIZE - STROKE) / 2;
const CIRC   = 2 * Math.PI * R;

function getGrade(s: number) {
  if (s >= 91) return { label: "Elite Candidate",    color: "#10b981", bg: "rgba(16,185,129,0.12)" };
  if (s >= 76) return { label: "Strong Candidate",   color: "#22d3ee", bg: "rgba(34,211,238,0.12)" };
  if (s >= 61) return { label: "Interview Ready",    color: "#818cf8", bg: "rgba(129,140,248,0.12)" };
  if (s >= 41) return { label: "Developing",         color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
  return               { label: "Needs Preparation", color: "#f43f5e", bg: "rgba(244,63,94,0.12)"   };
}

function getRingColor(s: number) {
  if (s >= 76) return ["#10b981", "#22d3ee"];
  if (s >= 61) return ["#6366f1", "#818cf8"];
  if (s >= 41) return ["#f59e0b", "#fb923c"];
  return              ["#f43f5e", "#e11d48"];
}

export default function AuraScoreRing({ score, isVisible }: AuraScoreRingProps) {
  const [displayed, setDisplayed] = useState(0);
  const [animated, setAnimated]   = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isVisible) return;
    const delay = setTimeout(() => {
      setAnimated(true);
      const start    = performance.now();
      const DURATION = 1800;

      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION, 1);
        const ease = 1 - Math.pow(1 - t, 3); // cubic ease-out
        setDisplayed(Math.round(ease * score));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, 400);

    return () => { clearTimeout(delay); cancelAnimationFrame(rafRef.current); };
  }, [isVisible, score]);

  const grade   = getGrade(score);
  const [c1, c2] = getRingColor(score);
  const gradientId = "aura-ring-grad";
  const dashOffset = animated ? CIRC * (1 - score / 100) : CIRC;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Ring */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={c1} />
              <stop offset="100%" stopColor={c2} />
            </linearGradient>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Track */}
          <circle cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none" stroke="rgba(71,85,105,0.25)" strokeWidth={STROKE} />

          {/* Glow ring (blurred copy) */}
          <motion.circle cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE + 4}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            opacity={0.25}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
          />

          {/* Main ring */}
          <motion.circle cx={SIZE/2} cy={SIZE/2} r={R}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.4 }}
          />
        </svg>

        {/* Centre content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span
            className="font-black tabular-nums leading-none"
            style={{
              fontSize: 56,
              fontFamily: "'Outfit', sans-serif",
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {displayed}
          </span>
          <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
            / 100
          </span>
        </div>
      </div>

      {/* Grade badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.4 }}
        className="px-5 py-2 rounded-full text-sm font-bold tracking-wide"
        style={{ background: grade.bg, border: `1px solid ${grade.color}44`, color: grade.color }}
      >
        {grade.label}
      </motion.div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ delay: 1.7 }}
        className="text-xs text-center max-w-[180px]"
        style={{ color: "var(--text-muted)" }}
      >
        Based on resume analysis + audio response evaluation
      </motion.p>
    </motion.div>
  );
}
