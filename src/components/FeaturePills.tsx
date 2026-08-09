"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Brain, Clock } from "lucide-react";

const PILLS = [
  { icon: Zap,    label: "Instant AI Analysis",       color: "#6366f1" },
  { icon: Brain,  label: "Personalised Feedback",     color: "#7c3aed" },
  { icon: Clock,  label: "Under 2 Minutes",           color: "#22d3ee" },
  { icon: Shield, label: "Privacy First — No Storage", color: "#10b981" },
];

export default function FeaturePills() {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {PILLS.map((pill, i) => {
        const Icon = pill.icon;
        return (
          <motion.div
            key={pill.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.08 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: pill.color }} />
            {pill.label}
          </motion.div>
        );
      })}
    </div>
  );
}
