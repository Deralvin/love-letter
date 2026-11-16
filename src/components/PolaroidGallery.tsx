"use client";

import { motion, useInView } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { LetterMemory } from "@/data/letterContent";

const EASE = [0.22, 1, 0.36, 1] as const;

function Polaroid({ memory, index }: { memory: LetterMemory; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  // `hovered` is for pointer devices, `pinned` is for taps on touch screens.
  // Combined so that a hover followed by a click does not cancel each other out.
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const active = hovered || pinned;

  return (
    <motion.div
      ref={ref}
      className="group relative w-full max-w-[16rem] shrink-0 cursor-pointer sm:max-w-[17rem]"
      style={{ zIndex: active ? 30 : 10 - index }}
      initial={{ opacity: 0, y: 34, rotate: memory.rotation * 1.6 }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              rotate: active ? 0 : memory.rotation,
              scale: active ? 1.05 : 1,
            }
          : undefined
      }
      transition={{ duration: 0.9, delay: index * 0.12, ease: EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTap={() => setPinned((prev) => !prev)}
    >
      <div className="rounded-[4px] border border-espresso/8 bg-white p-3 pb-14 shadow-[0_22px_48px_-26px_rgba(58,46,44,0.55)] transition-shadow duration-500 group-hover:shadow-[0_34px_60px_-24px_rgba(58,46,44,0.5)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-ivory">
          <Image
            src={memory.imageUrl}
            alt={memory.caption}
            fill
            sizes="(max-width: 640px) 80vw, 270px"
            className="object-cover saturate-[0.92] transition duration-700 group-hover:scale-[1.04] group-hover:saturate-100"
            priority={index === 0}
          />
          {/* Warm film-like tint */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-multiply"
            style={{
              background:
                "linear-gradient(160deg, rgba(229,193,133,0.18), rgba(200,109,81,0.14))",
            }}
          />
        </div>

        {/* Handwritten-style caption */}
        <div className="absolute inset-x-3 bottom-3">
          <motion.p
            className="font-hand text-[17px] leading-snug text-espresso/85"
            animate={{ opacity: active ? 1 : 0.78 }}
            transition={{ duration: 0.4 }}
          >
            {memory.caption}
          </motion.p>
          <motion.p
            className="mt-0.5 flex items-center gap-1.5 text-[10px] tracking-[0.16em] text-espresso/70 uppercase"
            animate={{ opacity: active ? 1 : 0, y: active ? 0 : 4 }}
            transition={{ duration: 0.35 }}
          >
            <Camera className="size-3" strokeWidth={1.8} />
            {memory.date}
          </motion.p>
        </div>
      </div>

      {/* Decorative tape */}
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-3deg] rounded-[2px] bg-gold/35 backdrop-blur-[1px]"
      />
    </motion.div>
  );
}

export default function PolaroidGallery({
  memories,
}: {
  memories: LetterMemory[];
}) {
  return (
    <section className="relative mt-20 sm:mt-28">
      <div className="mb-10 flex flex-col items-center text-center">
        <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.36em] text-terracotta-ink uppercase">
          <Sparkles className="size-3" strokeWidth={2} />
          Our memories
        </p>
        <h2 className="mt-4 font-serif text-2xl text-espresso sm:text-3xl">
          Little fragments I always keep
        </h2>
        <p className="mt-2 text-xs text-espresso/70">
          Tap or hover a photo to see the story behind it.
        </p>
      </div>

      <div className="flex flex-col items-center gap-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center sm:gap-6">
        {memories.map((memory, index) => (
          <Polaroid key={memory.id} memory={memory} index={index} />
        ))}
      </div>
    </section>
  );
}
