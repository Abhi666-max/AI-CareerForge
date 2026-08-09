"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="nav-blur sticky top-0 z-50 w-full border-b"
      style={{ backgroundColor: "rgba(9, 9, 11, 0.85)", borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center border"
            style={{ background: "#121214", borderColor: "var(--border-subtle)" }}
          >
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            AI <span className="gradient-text">CareerForge</span>
          </span>
        </a>

        {/* Right side: Nav links + CTA grouped together */}
        <div className="flex items-center gap-1">
          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium mr-2">
            <a
              href="#how-it-works"
              className="px-4 py-2 rounded-lg transition-all duration-200 hover:text-white hover:bg-white/5"
              style={{ color: "var(--text-secondary)" }}
            >
              How it works
            </a>
            <a
              href="#features"
              className="px-4 py-2 rounded-lg transition-all duration-200 hover:text-white hover:bg-white/5"
              style={{ color: "var(--text-secondary)" }}
            >
              Features
            </a>
          </div>

          {/* CTA */}
          <a
            href="#upload-section"
            className="btn-glow px-5 py-2 text-sm font-semibold flex items-center gap-2"
            id="nav-cta-button"
          >
            Get Started Free
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
