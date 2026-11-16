"use client";

import { motion } from "framer-motion";
import { Heart, Mail } from "lucide-react";
import { useState } from "react";

type EnvelopeIntroProps = {
  recipientName: string;
  hint: string;
  senderName: string;
  /** Called once, inside the click event handler (safe for autoplay). */
  onOpen: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function EnvelopeIntro({
  recipientName,
  hint,
  senderName,
  onOpen,
}: EnvelopeIntroProps) {
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    // Kick off audio + the page transition straight from the user gesture.
    onOpen();
  };

  return (
    <motion.section
      className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-5 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {/* Top label */}
      <motion.p
        className="mb-8 flex items-center gap-2 text-[10px] font-semibold tracking-[0.42em] text-terracotta-ink uppercase sm:text-[11px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.8, ease: EASE }}
      >
        <span className="h-px w-8 bg-terracotta/35" />
        A letter
        <span className="h-px w-8 bg-terracotta/35" />
      </motion.p>

      {/* Envelope */}
      <motion.button
        type="button"
        onClick={handleOpen}
        aria-label={`Open the letter for ${recipientName}`}
        className="group relative block w-[min(86vw,26rem)] cursor-pointer focus-visible:outline-none"
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.05, duration: 1, ease: EASE }}
        whileHover={opened ? undefined : { y: -4 }}
      >
        <div
          className="relative aspect-[3/2] w-full"
          style={{ perspective: "1400px" }}
        >
          {/* Soft shadow under the envelope */}
          <motion.div
            aria-hidden
            className="absolute -bottom-6 left-1/2 h-8 w-[85%] -translate-x-1/2 rounded-[50%] bg-espresso/18 blur-xl"
            animate={{ opacity: opened ? 0.35 : 0.5, scaleX: opened ? 1.06 : 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          />

          {/* The letter paper sliding up and out */}
          <motion.div
            aria-hidden
            className="absolute inset-x-[7%] top-[6%] z-10 rounded-sm bg-white/95 p-4 shadow-[0_-8px_24px_-14px_rgba(58,46,44,0.4)]"
            style={{ height: "72%" }}
            initial={{ y: 0, opacity: 0 }}
            animate={opened ? { y: "-34%", opacity: 1 } : { y: 0, opacity: 0 }}
            transition={{ duration: 1.05, delay: opened ? 0.5 : 0, ease: EASE }}
          >
            <div className="flex h-full flex-col justify-center gap-2 px-2">
              <div className="mx-auto h-1.5 w-16 rounded-full bg-rose/35" />
              {[92, 78, 86, 64].map((w, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full bg-espresso/12"
                  style={{ width: `${w}%` }}
                />
              ))}
              <Heart className="mx-auto mt-2 size-3 fill-rose/70 text-rose/70" />
            </div>
          </motion.div>

          {/* Envelope body */}
          <motion.div
            className="absolute inset-0 z-20 overflow-hidden rounded-[10px] shadow-[0_26px_60px_-30px_rgba(58,46,44,0.55)]"
            style={{
              background:
                "linear-gradient(158deg, #fbf1e7 0%, #f6e3d6 42%, #efd3c4 100%)",
              border: "1px solid rgba(200,109,81,0.18)",
            }}
            animate={opened ? { y: 6 } : { y: 0 }}
            transition={{ duration: 1, delay: opened ? 0.4 : 0, ease: EASE }}
          >
            {/* Left & right side folds (classic envelope look) */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom right, rgba(255,255,255,0.55) 0%, transparent 42%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 100%, 50% 44%, 0 0)",
                background:
                  "linear-gradient(105deg, rgba(200,109,81,0.16), rgba(200,109,81,0.03))",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                clipPath: "polygon(100% 100%, 50% 44%, 100% 0)",
                background:
                  "linear-gradient(255deg, rgba(200,109,81,0.16), rgba(200,109,81,0.03))",
              }}
            />
            {/* A thin stitched accent along the bottom edge */}
            <div
              aria-hidden
              className="absolute inset-x-6 bottom-3 border-t border-dashed border-terracotta/20"
            />
          </motion.div>

          {/* Top flap — swings open toward the back */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 z-30 origin-top"
            style={{ height: "58%", transformStyle: "preserve-3d" }}
            initial={{ rotateX: 0 }}
            animate={opened ? { rotateX: -168 } : { rotateX: 0 }}
            transition={{ duration: 1.15, ease: EASE }}
          >
            <div
              className="h-full w-full rounded-t-[10px]"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background:
                  "linear-gradient(180deg, #f9ebdd 0%, #f3dccd 68%, #ecd0bf 100%)",
                borderTop: "1px solid rgba(200,109,81,0.18)",
                filter: "drop-shadow(0 6px 8px rgba(58,46,44,0.12))",
              }}
            />
          </motion.div>

          {/* Wax seal */}
          <motion.div
            className="absolute top-[44%] left-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
            animate={
              opened
                ? { scale: 0.86, y: 10, opacity: 0.9 }
                : { scale: [1, 1.045, 1] }
            }
            transition={
              opened
                ? { duration: 0.6, ease: EASE }
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <div className="relative grid size-16 place-items-center rounded-full shadow-[0_10px_24px_-10px_rgba(141,47,61,0.85)] sm:size-20">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 34% 26%, #b04552 0%, #8d2f3d 55%, #6b1f2c 100%)",
                }}
              />
              {/* Gold sheen along the edge of the seal */}
              <div
                className="absolute inset-[3px] rounded-full border border-gold/45"
                style={{ boxShadow: "inset 0 0 12px rgba(229,193,133,0.28)" }}
              />
              <Heart
                className="relative size-6 fill-gold/85 text-gold/85 sm:size-7"
                strokeWidth={1.2}
              />
              {/* Pulsing ring */}
              {!opened && (
                <motion.span
                  className="absolute inset-0 rounded-full border border-rose/40"
                  animate={{ scale: [1, 1.45], opacity: [0.55, 0] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.button>

      {/* Recipient name + hint */}
      <motion.div
        className="mt-12 flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.9, ease: EASE }}
      >
        <p className="font-hand text-2xl text-terracotta-ink sm:text-3xl">
          For {recipientName},
        </p>

        <motion.p
          className="mt-4 max-w-[19rem] text-[13px] leading-relaxed text-espresso/75 sm:max-w-sm sm:text-sm"
          animate={opened ? { opacity: 0 } : { opacity: [0.6, 1, 0.6] }}
          transition={
            opened
              ? { duration: 0.4 }
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {hint}
        </motion.p>

        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose/45 px-3.5 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-terracotta-ink uppercase">
          <Mail className="size-3" strokeWidth={2} />
          from {senderName}
        </span>
      </motion.div>
    </motion.section>
  );
}
