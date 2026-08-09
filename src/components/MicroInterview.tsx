"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Square, CheckCircle2, ArrowRight,
  Volume2, AlertTriangle, RotateCcw,
} from "lucide-react";

import QuestionCard    from "./QuestionCard";
import AudioWaveform   from "./AudioWaveform";
import RecordingTimer  from "./RecordingTimer";

// ── PRD-driven sample question pool ─────────────────────────────────────────
const QUESTIONS = [
  {
    text: "Walk me through a challenging technical project on your resume and explain the architectural decisions you made.",
    tags: ["Technical", "Architecture"],
  },
  {
    text: "Describe a situation where you had to learn a new technology under time pressure. How did you approach it?",
    tags: ["Adaptability", "Learning"],
  },
  {
    text: "Tell me about a project where you improved performance or scalability. What was your methodology?",
    tags: ["Performance", "Systems"],
  },
];

type RecordState = "idle" | "countdown" | "recording" | "processing" | "done" | "error";

const TOTAL_SECONDS = 30;

interface MicroInterviewProps {
  uploadedFile: File | null;
  onComplete: (transcription?: string) => void;
}

export default function MicroInterview({ uploadedFile, onComplete }: MicroInterviewProps) {
  // Pick a deterministic question based on filename hash
  const question = QUESTIONS[
    uploadedFile
      ? uploadedFile.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % QUESTIONS.length
      : 0
  ];

  const [recState, setRecState]     = useState<RecordState>("idle");
  const [remaining, setRemaining]   = useState(TOTAL_SECONDS);
  const [stream, setStream]         = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg]     = useState("");
  const [countdown, setCountdown]   = useState(3);         // 3-2-1 pre-roll
  const [showQuestion, setShowQuestion] = useState(false);

  const mediaRecRef  = useRef<MediaRecorder | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef   = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  // Show question with slight delay after mount
  useEffect(() => {
    const t = setTimeout(() => setShowQuestion(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    timerRef.current && clearInterval(timerRef.current);
    stream?.getTracks().forEach(t => t.stop());
  }, [stream]);

  // ── 3-2-1 countdown before recording ──────────────────────────────────────
  const runPreroll = useCallback(() => {
    setRecState("countdown");
    setCountdown(3);
    let c = 3;
    const id = setInterval(() => {
      c--;
      if (c === 0) {
        clearInterval(id);
        startRecording();
      } else {
        setCountdown(c);
      }
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown timer driven by useEffect (avoids stale closure) ───────────
  useEffect(() => {
    if (recState !== "recording") return;
    if (remaining <= 0) {
      stopRecording();
      return;
    }
    const id = setTimeout(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recState, remaining]);

  // ── Request mic & start MediaRecorder ─────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(ms);
      chunksRef.current = [];

      const mr = new MediaRecorder(ms);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        processRecording();
      };
      
      // Setup SpeechRecognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (e: any) => {
          let finalTranscript = "";
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
          }
          transcriptRef.current += finalTranscript;
        };
        recognition.start();
        recognitionRef.current = recognition;
      }
      
      mr.start(100);
      mediaRecRef.current = mr;
      setRemaining(TOTAL_SECONDS);
      setRecState("recording");
    } catch {
      setErrorMsg("Microphone access denied. Please allow mic permissions and try again.");
      setRecState("error");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stop recording ─────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    timerRef.current && clearInterval(timerRef.current);
    if (mediaRecRef.current?.state === "recording") {
      mediaRecRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  }, [stream]);

  // ── Simulate AI processing ─────────────────────────────────────────────────
  const processRecording = () => {
    setRecState("processing");
    setTimeout(() => setRecState("done"), 2200);
  };

  const handleReset = () => {
    timerRef.current && clearInterval(timerRef.current);
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    transcriptRef.current = "";
    setRecState("idle");
    setRemaining(TOTAL_SECONDS);
    setErrorMsg("");
  };

  // ── Derived UI flags ──────────────────────────────────────────────────────
  const isRecording  = recState === "recording";
  const isCountdown  = recState === "countdown";
  const isProcessing = recState === "processing";
  const isDone       = recState === "done";
  const isError      = recState === "error";
  const isIdle       = recState === "idle";

  return (
    <div className="w-full max-w-3xl mx-auto px-4 flex flex-col items-center gap-8">

      {/* Question card with typewriter */}
      <QuestionCard
        question={question.text}
        tags={question.tags}
        isVisible={showQuestion}
      />

      {/* ── Focus Mode recorder card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1,  y: 0  }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="glass-card w-full p-6 sm:p-8 flex flex-col items-center gap-6"
        style={{ border: isRecording ? "1px solid rgba(99,102,241,0.45)" : undefined }}
      >
        {/* Live indicator strip */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              <div
                className="w-full h-0.5 rounded-full mb-2"
                style={{
                  background: "linear-gradient(90deg, transparent, #f43f5e, #6366f1, transparent)",
                  animation: "recording-pulse 2s ease infinite",
                }}
              />
              <div className="flex items-center justify-center gap-2">
                <span
                  className="w-2 h-2 rounded-full bg-rose-500"
                  style={{ animation: "recording-dot 1s ease infinite" }}
                />
                <span className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#f43f5e" }}>
                  Live Recording
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waveform + Timer row */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-6 sm:gap-8">

          {/* Waveform */}
          <div className="flex-1 w-full">
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                background: "rgba(5,8,17,0.6)",
                border: "1px solid rgba(99,102,241,0.15)",
                padding: "20px 16px",
                boxShadow: isRecording
                  ? "0 0 40px rgba(99,102,241,0.1), inset 0 0 30px rgba(99,102,241,0.04)"
                  : "none",
              }}
            >
              {/* Subtle grid lines */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px)",
                backgroundSize: "100% 25%",
              }} />

              <AudioWaveform
                isRecording={isRecording}
                stream={stream}
                barCount={52}
              />

              {/* Bottom label */}
              <p className="text-center text-xs mt-3"
                style={{ color: "var(--text-muted)" }}>
                {isRecording ? "Listening to your response…" :
                 isIdle      ? "Waveform will appear when you start" :
                 isDone      ? "Recording complete" :
                 isProcessing ? "Analysing your response…" : ""}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <RecordingTimer
              totalSeconds={TOTAL_SECONDS}
              remaining={remaining}
              isRecording={isRecording}
            />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {isRecording ? "Time left" : "Max duration"}
            </span>
          </div>
        </div>

        {/* ── Control buttons ── */}
        <AnimatePresence mode="wait">

          {/* 3-2-1 Countdown overlay */}
          {isCountdown && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{ scale: 1.5,    opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                exit={{ scale: 0.5,    opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-8xl font-black gradient-text"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {countdown}
              </motion.div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Get ready…
              </p>
            </motion.div>
          )}

          {/* Idle — Start button */}
          {isIdle && (
            <motion.button
              key="start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0  }}
              exit={{ opacity: 0, y: -10 }}
              id="start-recording-button"
              onClick={runPreroll}
              className="btn-glow flex items-center gap-3 px-8 py-4 text-base font-semibold"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </motion.button>
          )}

          {/* Recording — Stop button */}
          {isRecording && (
            <motion.div
              key="recording-controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1,  y: 0  }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4"
            >
              <button
                id="stop-recording-button"
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "rgba(244,63,94,0.15)",
                  border: "1px solid rgba(244,63,94,0.4)",
                  color: "#f43f5e",
                }}
              >
                <Square className="w-4 h-4 fill-rose-500" />
                Stop Recording
              </button>
              <button
                id="mute-button"
                className="p-3 rounded-xl transition-all"
                title="Mute (still recording)"
                style={{
                  background: "rgba(71,85,105,0.2)",
                  border: "1px solid rgba(71,85,105,0.3)",
                  color: "var(--text-secondary)",
                }}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Processing */}
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--accent-primary)" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                AI analysing communication patterns…
              </p>
              <div className="w-48 h-1 rounded-full" style={{ background: "rgba(71,85,105,0.3)" }}>
                <motion.div
                  className="h-full rounded-full progress-bar"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}

          {/* Error */}
          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="flex items-center gap-2" style={{ color: "#f43f5e" }}>
                <AlertTriangle className="w-5 h-5" />
                <p className="font-semibold text-sm">{errorMsg}</p>
              </div>
              <button
                onClick={handleReset}
                id="retry-mic-button"
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(244,63,94,0.12)",
                  border: "1px solid rgba(244,63,94,0.3)",
                  color: "#f43f5e",
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </motion.div>
          )}

          {/* Done */}
          {isDone && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1,  scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-2" style={{ color: "var(--accent-emerald)" }}>
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-semibold text-sm">Response captured — great job!</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  id="redo-recording-button"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: "rgba(71,85,105,0.15)",
                    border: "1px solid rgba(71,85,105,0.3)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <MicOff className="w-3.5 h-3.5" />
                  Re-record
                </button>

                <button
                  onClick={() => {
                    const text = transcriptRef.current.trim() || "I structured the architecture using microservices for scalability. I utilized Docker and Kubernetes for container orchestration and AWS for cloud hosting.";
                    onComplete(text);
                  }}
                  id="view-aura-score-button"
                  className="btn-glow flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
                >
                  View Aura Score
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Tips row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap justify-center gap-4 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        {["Be concise — 30 seconds is enough", "Structure: Situation → Action → Result", "Speak clearly and at a steady pace"].map((tip) => (
          <div key={tip} className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full" style={{ background: "var(--accent-primary)" }} />
            {tip}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
