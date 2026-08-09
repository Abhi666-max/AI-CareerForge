"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Tag } from "lucide-react";

interface QuestionCardProps {
  question: string;
  tags: string[];
  isVisible: boolean;
}

/** Renders the question with a character-by-character typewriter effect */
export default function QuestionCard({ question, tags, isVisible }: QuestionCardProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isVisible) { setDisplayed(""); setDone(false); return; }

    setDisplayed("");
    setDone(false);
    let i = 0;
    const SPEED = 28; // ms per char

    const id = setInterval(() => {
      i++;
      setDisplayed(question.slice(0, i));
      if (i >= question.length) {
        clearInterval(id);
        setDone(true);
      }
    }, SPEED);

    return () => clearInterval(id);
  }, [question, isVisible]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-2xl"
    >
      {/* AI badge */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.35)",
            color: "var(--accent-primary)",
          }}
        >
          <Brain className="w-3 h-3" />
          AI-Generated Question
        </div>

        {/* Skill tags */}
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "#a78bfa",
            }}
          >
            <Tag className="w-2.5 h-2.5" />
            {tag}
          </div>
        ))}
      </div>

      {/* Question bubble */}
      <div
        className="relative rounded-2xl p-6 sm:p-8"
        style={{
          background: "rgba(12,17,30,0.85)",
          border: "1px solid rgba(99,102,241,0.2)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 0 60px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Corner accent */}
        <div
          className="absolute top-0 left-0 w-24 h-24 rounded-tl-2xl rounded-br-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.6), transparent)" }}
        />

        <p
          className="relative text-xl sm:text-2xl font-semibold leading-relaxed"
          style={{ color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}
        >
          &ldquo;{displayed}
          {/* Blinking cursor while typing */}
          {!done && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              className="inline-block w-0.5 h-6 ml-0.5 align-middle rounded-full"
              style={{ background: "var(--accent-primary)" }}
            />
          )}
          {done && "\u201d"}
        </p>
      </div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={done ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-3 text-xs text-center"
        style={{ color: "var(--text-muted)" }}
      >
        Take a moment to structure your answer, then press <strong style={{ color: "var(--text-secondary)" }}>Start Recording</strong>
      </motion.p>
    </motion.div>
  );
}
