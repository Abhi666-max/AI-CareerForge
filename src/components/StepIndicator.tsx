"use client";

import { motion } from "framer-motion";
import { Upload, Mic, BarChart3, Check } from "lucide-react";
import type { AppPhase } from "@/app/page";

const STEPS = [
  { id: "upload",    label: "Resume Upload",    icon: Upload,   phase: "upload" as AppPhase },
  { id: "interview", label: "Micro Interview",  icon: Mic,      phase: "interview" as AppPhase },
  { id: "dashboard", label: "Aura Dashboard",   icon: BarChart3, phase: "dashboard" as AppPhase },
];

interface StepIndicatorProps {
  currentPhase: AppPhase;
}

export default function StepIndicator({ currentPhase }: StepIndicatorProps) {
  const phaseOrder: AppPhase[] = ["upload", "interview", "dashboard"];
  const currentIndex = phaseOrder.indexOf(currentPhase);

  return (
    <div className="flex items-center gap-0 mt-4">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isActive    = i === currentIndex;
        const Icon        = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step node */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.3 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: isCompleted
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : isActive
                    ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                    : "rgba(71,85,105,0.3)",
                  border: isActive
                    ? "2px solid rgba(99,102,241,0.6)"
                    : isCompleted
                    ? "2px solid rgba(16,185,129,0.6)"
                    : "2px solid rgba(71,85,105,0.3)",
                  boxShadow: isActive
                    ? "0 0 20px rgba(99,102,241,0.4)"
                    : isCompleted
                    ? "0 0 12px rgba(16,185,129,0.3)"
                    : "none",
                }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Icon className="w-4 h-4 text-white" />
                )}

                {/* Active pulse ring */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-full pulse-ring"
                    style={{ border: "2px solid rgba(99,102,241,0.4)" }}
                  />
                )}
              </div>

              <span
                className="text-xs font-medium tracking-wide whitespace-nowrap"
                style={{
                  color: isActive
                    ? "var(--accent-primary)"
                    : isCompleted
                    ? "var(--accent-emerald)"
                    : "var(--text-muted)",
                }}
              >
                {step.label}
              </span>
            </motion.div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="w-16 sm:w-24 h-px mx-3 mb-5 relative overflow-hidden rounded-full"
                style={{ background: "rgba(71,85,105,0.3)" }}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #6366f1, #7c3aed)",
                    boxShadow: "0 0 8px rgba(99,102,241,0.5)",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: i < currentIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
