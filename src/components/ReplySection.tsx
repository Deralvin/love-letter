"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, Send, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { LetterConfig } from "@/data/letterContent";

const EASE = [0.22, 1, 0.36, 1] as const;
const BURST_COUNT = 18;

/** Deterministic PRNG (mulberry32) — used when the client triggers a burst. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type BurstParticle = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotate: number;
  delay: number;
  hue: string;
};

export default function ReplySection({ content }: { content: LetterConfig }) {
  const { reply, whatsappNumber, whatsappPrefillText } = content;
  const [burstKey, setBurstKey] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const particles = useMemo<BurstParticle[]>(() => {
    if (burstKey === 0) return [];
    const random = seededRandom(burstKey * 7919);
    const hues = ["#d48c94", "#c86d51", "#e5c185", "#8d2f3d", "#f2d8da"];

    return Array.from({ length: BURST_COUNT }, (_, index) => ({
      id: index,
      x: (random() - 0.5) * 340,
      y: -(70 + random() * 260),
      size: 10 + random() * 18,
      rotate: (random() - 0.5) * 220,
      delay: random() * 0.16,
      hue: hues[Math.floor(random() * hues.length)],
    }));
  }, [burstKey]);

  const whatsappUrl = useMemo(() => {
    const digits = whatsappNumber.replace(/\D/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(whatsappPrefillText)}`;
  }, [whatsappNumber, whatsappPrefillText]);

  const handleReply = useCallback(() => {
    setBurstKey((prev) => prev + 1);
    setShowPopup(true);
  }, []);

  return (
    <section className="relative mt-20 mb-6 flex flex-col items-center sm:mt-28">
      {/* Heart burst */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/2 left-1/2 z-20 h-0 w-0"
      >
        <AnimatePresence>
          {burstKey > 0 &&
            particles.map((particle) => (
              <motion.span
                key={`${burstKey}-${particle.id}`}
                className="absolute"
                style={{ color: particle.hue }}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.3, rotate: 0 }}
                animate={{
                  opacity: 0,
                  x: particle.x,
                  y: particle.y,
                  scale: 1,
                  rotate: particle.rotate,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: particle.delay,
                  ease: [0.16, 0.84, 0.44, 1],
                }}
              >
                <Heart
                  style={{ width: particle.size, height: particle.size }}
                  className="fill-current drop-shadow-[0_4px_8px_rgba(141,47,61,0.25)]"
                  strokeWidth={0}
                />
              </motion.span>
            ))}
        </AnimatePresence>
      </div>

      <motion.p
        className="text-center font-serif text-sm italic text-espresso/70 sm:text-base"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        If you made it all the way here, it means you read every word.
      </motion.p>

      <motion.button
        type="button"
        onClick={handleReply}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.12, ease: EASE }}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.975 }}
        className="group relative mt-7 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-br from-terracotta-ink to-wine px-7 py-4 text-[13px] font-semibold tracking-[0.06em] text-cream shadow-[0_22px_44px_-20px_rgba(141,47,61,0.65)] focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 focus-visible:ring-offset-cream focus-visible:outline-none sm:text-sm"
      >
        <motion.span
          className="grid place-items-center"
          animate={{ scale: [1, 1.16, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="size-4 fill-cream" strokeWidth={1.5} />
        </motion.span>
        {reply.buttonLabel}
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      </motion.button>

      {/* Reply pop-up */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div
              className="absolute inset-0 bg-espresso/38 backdrop-blur-[3px]"
              onClick={() => setShowPopup(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reply-title"
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-rose/25 bg-cream px-6 py-8 text-center shadow-[0_40px_90px_-40px_rgba(58,46,44,0.7)]"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                aria-label="Close"
                className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-espresso/60 transition-colors hover:bg-rose/12 hover:text-espresso"
              >
                <X className="size-4" strokeWidth={1.8} />
              </button>

              <div className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-terracotta to-wine shadow-[0_14px_28px_-14px_rgba(141,47,61,0.75)]">
                <Heart className="size-6 fill-cream" strokeWidth={1.4} />
              </div>

              <h2
                id="reply-title"
                className="mt-5 font-serif text-xl text-espresso"
              >
                {reply.popupTitle}
              </h2>

              <p className="mt-3 text-[13.5px] leading-relaxed text-espresso/80">
                {reply.popupMessage}
              </p>

              <p className="mt-4 font-hand text-lg text-terracotta-ink">
                {reply.popupNote}
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-5 py-3.5 text-[13px] font-semibold text-cream transition-colors hover:bg-espresso/90 focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 focus-visible:ring-offset-cream focus-visible:outline-none"
              >
                <MessageCircle className="size-4" strokeWidth={1.9} />
                {reply.whatsappButtonLabel}
                <Send className="size-3.5" strokeWidth={1.9} />
              </a>

              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="mt-3 px-3 py-2 text-[11px] font-medium tracking-[0.14em] text-espresso/75 uppercase transition-colors hover:text-espresso"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
