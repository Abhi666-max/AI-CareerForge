"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface RecordingTimerProps {
  totalSeconds: number;
  remaining: number;
  isRecording: boolean;
}

export default function RecordingTimer({
  totalSeconds,
  remaining,
  isRecording,
}: RecordingTimerProps) {
  const SIZE     = 120;
  const STROKE   = 6;
  const R        = (SIZE - STROKE) / 2;
  const CIRC     = 2 * Math.PI * R;
  const progress = remaining / totalSeconds;          // 1 → 0
  const dashOffset = CIRC * (1 - progress);

  // Urgency colour
  const ringColor =
    remaining > 15 ? "#6366f1" :
    remaining > 8  ? "#f59e0b" :
                     "#f43f5e";

  const textColor =
    remaining > 15 ? "var(--text-primary)" :
    remaining > 8  ? "#f59e0b" :
                     "#f43f5e";

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-label={`${remaining} seconds remaining`}
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="rgba(71,85,105,0.3)"
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: 0 }}
          animate={{
            strokeDashoffset: dashOffset,
            stroke: ringColor,
            filter: isRecording
              ? `drop-shadow(0 0 6px ${ringColor})`
              : "none",
          }}
          transition={{ duration: 0.8, ease: "linear" }}
        />
      </svg>

      {/* Centre content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={remaining}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-black tabular-nums"
          style={{
            color: textColor,
            fontFamily: "'Outfit', sans-serif",
            lineHeight: 1,
          }}
        >
          {remaining}
        </motion.span>
        <span className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          sec
        </span>
      </div>

      {/* Pulsing glow ring while recording */}
      {isRecording && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ border: `2px solid ${ringColor}` }}
        />
      )}
    </div>
  );
}
