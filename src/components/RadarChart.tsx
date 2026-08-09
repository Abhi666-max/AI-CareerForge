"use client";

import { motion } from "framer-motion";

interface PillarData {
  name: string;
  score: number;
  color: string;
  icon: React.ReactNode;
  insight: string;
}

interface RadarChartProps {
  pillars: PillarData[];
  isVisible: boolean;
}

const CX = 150;
const CY = 150;
const R  = 100;     // max radius
const GRID_LEVELS = [0.25, 0.5, 0.75, 1.0];
// 4 axes: top=Technical, right=Portfolio, bottom=Communication, left=Resume
const ANGLES = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

function polarToXY(angle: number, radius: number) {
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
}

function buildPolygon(values: number[]): string {
  return values
    .map((v, i) => {
      const pt = polarToXY(ANGLES[i], R * Math.min(v / 100, 1));
      return `${pt.x},${pt.y}`;
    })
    .join(" ");
}

function buildGrid(level: number): string {
  return ANGLES.map(a => {
    const pt = polarToXY(a, R * level);
    return `${pt.x},${pt.y}`;
  }).join(" ");
}

export default function RadarChart({ pillars, isVisible }: RadarChartProps) {
  const scores   = pillars.map(p => p.score);
  const dataPoints = buildPolygon(scores);

  const LABEL_OFFSET = 22;
  const labelPositions = ANGLES.map((a, i) => {
    const pt = polarToXY(a, R + LABEL_OFFSET);
    return { ...pt, pillar: pillars[i] };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-col items-center"
    >
      <svg viewBox="0 0 300 300" width="100%" style={{ maxWidth: 300, overflow: "visible" }}>
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.12" />
          </radialGradient>
          <filter id="radar-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid rings */}
        {GRID_LEVELS.map((level, li) => (
          <polygon
            key={li}
            points={buildGrid(level)}
            fill="none"
            stroke={level === 1.0 ? "rgba(99,102,241,0.25)" : "rgba(71,85,105,0.2)"}
            strokeWidth={level === 1.0 ? 1.5 : 1}
            strokeDasharray={level === 1.0 ? "none" : "3,3"}
          />
        ))}

        {/* Axis spokes */}
        {ANGLES.map((angle, i) => {
          const end = polarToXY(angle, R);
          return (
            <line
              key={i}
              x1={CX} y1={CY}
              x2={end.x} y2={end.y}
              stroke="rgba(71,85,105,0.3)"
              strokeWidth={1}
            />
          );
        })}

        {/* Percentage labels on grid */}
        {["25%", "50%", "75%"].map((pct, i) => (
          <text
            key={pct}
            x={CX + 3}
            y={CY - R * GRID_LEVELS[i] - 3}
            fill="rgba(71,85,105,0.7)"
            fontSize="7"
            textAnchor="start"
          >
            {pct}
          </text>
        ))}

        {/* Filled data polygon — animated from center */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.6 }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          {/* Glow copy */}
          <polygon
            points={dataPoints}
            fill="url(#radar-fill)"
            stroke="#6366f1"
            strokeWidth={3}
            filter="url(#radar-glow)"
            opacity={0.5}
          />
          {/* Sharp copy */}
          <polygon
            points={dataPoints}
            fill="url(#radar-fill)"
            stroke="#818cf8"
            strokeWidth={1.5}
          />
        </motion.g>

        {/* Data point dots */}
        {scores.map((score, i) => {
          const pt = polarToXY(ANGLES[i], R * Math.min(score / 100, 1));
          return (
            <motion.circle
              key={i}
              cx={pt.x} cy={pt.y} r={5}
              fill={pillars[i].color}
              stroke={pillars[i].color}
              strokeWidth={2}
              strokeOpacity={0.4}
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
              style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
            />
          );
        })}

        {/* Axis labels */}
        {labelPositions.map(({ x, y, pillar }, i) => {
          const isLeft  = i === 3;
          const isRight = i === 1;
          const anchor  = isLeft ? "end" : isRight ? "start" : "middle";
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: 1.4 + i * 0.08 }}
            >
              <text
                x={x} y={y - 4}
                fill={pillar.color}
                fontSize="10"
                fontWeight="700"
                textAnchor={anchor}
                fontFamily="Inter, sans-serif"
              >
                {pillar.name}
              </text>
              <text
                x={x} y={y + 9}
                fill="rgba(148,163,184,0.8)"
                fontSize="9"
                fontWeight="600"
                textAnchor={anchor}
                fontFamily="Inter, sans-serif"
              >
                {pillar.score}/100
              </text>
            </motion.g>
          );
        })}
      </svg>
    </motion.div>
  );
}
