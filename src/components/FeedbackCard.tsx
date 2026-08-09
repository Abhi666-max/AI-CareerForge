"use client";

import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, AlertCircle, Info } from "lucide-react";

export type FeedbackPriority = "high" | "medium" | "low";

export interface FeedbackItem {
  priority: FeedbackPriority;
  category: string;
  title: string;
  description: string;
  action: string;
}

interface FeedbackCardProps {
  item: FeedbackItem;
  index: number;
  isVisible: boolean;
}

const PRIORITY_CONFIG = {
  high: {
    label: "High Priority",
    color: "#f43f5e",
    bg:    "rgba(244,63,94,0.08)",
    border:"rgba(244,63,94,0.25)",
    barBg: "rgba(244,63,94,0.15)",
    Icon:  AlertTriangle,
  },
  medium: {
    label: "Medium Priority",
    color: "#f59e0b",
    bg:    "rgba(245,158,11,0.08)",
    border:"rgba(245,158,11,0.25)",
    barBg: "rgba(245,158,11,0.15)",
    Icon:  AlertCircle,
  },
  low: {
    label: "Low Priority",
    color: "#6366f1",
    bg:    "rgba(99,102,241,0.08)",
    border:"rgba(99,102,241,0.2)",
    barBg: "rgba(99,102,241,0.1)",
    Icon:  Info,
  },
} as const;

export default function FeedbackCard({ item, index, isVisible }: FeedbackCardProps) {
  const cfg = PRIORITY_CONFIG[item.priority];
  const { Icon } = cfg;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="glass-card p-5 flex flex-col gap-3 group hover:border-opacity-60 transition-all duration-300"
      style={{ borderColor: cfg.border }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: cfg.bg }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5"
              style={{ color: cfg.color }}>
              {cfg.label} · {item.category}
            </p>
            <p className="text-sm font-semibold leading-tight"
              style={{ color: "var(--text-primary)" }}>
              {item.title}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {item.description}
      </p>

      {/* Action chip */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
        style={{ background: cfg.barBg, border: `1px solid ${cfg.border}` }}
      >
        <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: cfg.color }} />
        <span style={{ color: "var(--text-primary)" }}>{item.action}</span>
      </div>
    </motion.div>
  );
}
