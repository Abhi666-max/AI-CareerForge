"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AudioWaveformProps {
  isRecording: boolean;
  /** MediaStream from getUserMedia — null until granted */
  stream: MediaStream | null;
  barCount?: number;
}

/** Idle animation — a flowing sine wave across bar indices */
function idleHeight(i: number, barCount: number, tick: number): number {
  const phase = (i / barCount) * Math.PI * 2;
  const wave1 = Math.sin(phase + tick * 0.06) * 0.35;
  const wave2 = Math.sin(phase * 2.1 + tick * 0.09) * 0.18;
  const wave3 = Math.sin(phase * 0.7 + tick * 0.04) * 0.12;
  return 0.08 + Math.max(0, wave1 + wave2 + wave3);
}

export default function AudioWaveform({
  isRecording,
  stream,
  barCount = 48,
}: AudioWaveformProps) {
  const animFrameRef = useRef<number>(0);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const dataRef      = useRef<Uint8Array>(new Uint8Array(barCount));
  const tickRef      = useRef(0);

  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: barCount }, (_, i) => idleHeight(i, barCount, 0))
  );

  // --- Wire up analyser when stream appears ---
  useEffect(() => {
    if (!stream || !isRecording) {
      analyserRef.current = null;
      return;
    }
    const ctx      = new AudioContext();
    const source   = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize            = 128;          // 64 frequency bins
    analyser.smoothingTimeConstant = 0.78;
    source.connect(analyser);
    analyserRef.current = analyser;
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);

    return () => {
      source.disconnect();
      ctx.close();
      analyserRef.current = null;
    };
  }, [stream, isRecording]);

  // --- rAF loop ---
  useEffect(() => {
    let cancelled = false;

    const loop = () => {
      if (cancelled) return;
      tickRef.current++;
      const tick = tickRef.current;

      if (isRecording && analyserRef.current) {
        // ── Live audio path ──
        const analyser = analyserRef.current;
        analyser.getByteFrequencyData(dataRef.current as any);
        const binCount = dataRef.current.length; // 64

        const newBars = Array.from({ length: barCount }, (_, i) => {
          // Map bar index → bin index with slight emphasis on lows/mids
          const binIdx = Math.floor((i / barCount) * binCount * 0.85);
          const raw    = dataRef.current[Math.min(binIdx, binCount - 1)] / 255;
          // Add tiny idle layer so silent bars don't collapse to 0
          const idle   = idleHeight(i, barCount, tick) * 0.15;
          return Math.max(0.04, raw * 0.92 + idle);
        });
        setBars(newBars);
      } else {
        // ── Idle / paused path ──
        setBars(
          Array.from({ length: barCount }, (_, i) => idleHeight(i, barCount, tick))
        );
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording, barCount]);

  // Colour stops: indigo → violet → cyan
  const getColor = (normalised: number, i: number): string => {
    if (!isRecording) return `hsl(${240 + (i / barCount) * 40}, 70%, 62%)`;
    // Hot colour when loud
    if (normalised > 0.75) return "#f43f5e";   // rose
    if (normalised > 0.5)  return "#a78bfa";   // violet-light
    return "#6366f1";                           // indigo
  };

  return (
    <div
      className="flex items-center justify-center gap-[3px] w-full"
      style={{ height: 96 }}
      aria-hidden="true"
    >
      {bars.map((h, i) => {
        const heightPx = Math.round(h * 80) + 4; // 4..84 px
        return (
          <motion.div
            key={i}
            animate={{ height: heightPx }}
            transition={{
              type: "spring",
              stiffness: isRecording ? 420 : 180,
              damping:   isRecording ? 22  : 28,
              mass: 0.6,
            }}
            style={{
              width: `${100 / barCount - 0.4}%`,
              maxWidth: 10,
              minHeight: 4,
              borderRadius: 99,
              background: `linear-gradient(180deg, ${getColor(h, i)}, ${getColor(h, i)}88)`,
              boxShadow: isRecording && h > 0.4
                ? `0 0 6px ${getColor(h, i)}88`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}
