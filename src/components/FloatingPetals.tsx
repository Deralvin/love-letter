"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Background particles: rose petals + warm light bokeh.
 *
 * Performance notes (see AGENTS.md §3.B):
 * - Particle count is capped at 16 elements.
 * - Positions come from a fixed-seed PRNG, so the server and client render
 *   identically -> no hydration mismatch.
 * - The layer uses `pointer-events-none` and only animates transform
 *   + opacity (GPU friendly, no layout reflow).
 */

const PETAL_COUNT = 16;

/** Mulberry32 — a small fixed-seed PRNG, deterministic on server & client. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Petal = {
  id: number;
  kind: "petal" | "bokeh";
  left: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
  rotate: number;
  startY: number;
  opacity: number;
  hue: string;
};

function buildPetals(): Petal[] {
  const random = createRandom(20260214);
  const palette = [
    "rgba(212, 140, 148, 0.55)", // dusty rose
    "rgba(200, 109, 81, 0.42)", // terracotta soft
    "rgba(229, 193, 133, 0.5)", // champagne gold
    "rgba(242, 216, 218, 0.75)", // rose sangat muda
  ];

  return Array.from({ length: PETAL_COUNT }, (_, index) => {
    const isBokeh = index % 5 === 0;
    return {
      id: index,
      kind: isBokeh ? "bokeh" : "petal",
      left: random() * 100,
      size: isBokeh ? 6 + random() * 8 : 10 + random() * 12,
      drift: (random() - 0.5) * 180,
      duration: 22 + random() * 20,
      delay: random() * 20,
      rotate: 180 + random() * 540,
      startY: -(10 + random() * 40),
      opacity: isBokeh ? 0.35 + random() * 0.3 : 0.45 + random() * 0.35,
      hue: palette[Math.floor(random() * palette.length)],
    };
  });
}

export default function FloatingPetals() {
  const petals = useMemo(() => buildPetals(), []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Glow pusat lembut agar teks tetap punya kontras */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_38%,rgba(255,255,255,0.65),transparent_70%)]" />

      {petals.map((petal) => (
        <motion.span
          key={petal.id}
          className="absolute top-0 block will-change-transform"
          style={{
            left: `${petal.left}%`,
            width: petal.size,
            height: petal.kind === "bokeh" ? petal.size : petal.size * 1.35,
            backgroundColor: petal.hue,
            borderRadius:
              petal.kind === "bokeh" ? "9999px" : "60% 0 60% 0",
            filter:
              petal.kind === "bokeh"
                ? "blur(1.5px)"
                : "blur(0.3px) drop-shadow(0 2px 4px rgba(200,109,81,0.12))",
          }}
          initial={{ y: petal.startY, x: 0, rotate: 0, opacity: 0 }}
          animate={{
            // Semua value punya 4 keyframe supaya `times` berlaku seragam:
            // fade-in cepat di awal, memudar di 15% terakhir.
            y: ["-10vh", "22vh", "78vh", "110vh"],
            x: [0, petal.drift * 0.55, petal.drift, 0],
            rotate: [0, petal.rotate * 0.35, petal.rotate * 0.7, petal.rotate],
            opacity: [0, petal.opacity, petal.opacity, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.15, 0.85, 1],
          }}
        />
      ))}
    </div>
  );
}
