"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "94%",  label: "Accuracy Rate" },
  { value: "2 min", label: "Avg. Completion" },
  { value: "50K+", label: "Profiles Evaluated" },
  { value: "4.9★", label: "User Rating" },
];

export default function HeroStats() {
  return (
    <div
      className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-12 pt-10 w-full max-w-2xl"
      style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
    >
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + i * 0.08 }}
          className="text-center"
        >
          <p
            className="text-2xl font-black gradient-text"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {stat.value}
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
