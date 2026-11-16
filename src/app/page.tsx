"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import EnvelopeIntro from "@/components/EnvelopeIntro";
import FloatingPetals from "@/components/FloatingPetals";
import LoveLetterBody from "@/components/LoveLetterBody";
import PolaroidGallery from "@/components/PolaroidGallery";
import ReplySection from "@/components/ReplySection";
import { letterContent } from "@/data/letterContent";

const EASE = [0.22, 1, 0.36, 1] as const;

type View = "envelope" | "letter";

export default function HomePage() {
  const [view, setView] = useState<View>("envelope");
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearFade = useCallback(() => {
    if (fadeTimer.current) {
      clearInterval(fadeTimer.current);
      fadeTimer.current = null;
    }
  }, []);

  /**
   * Volume fade-in from 0 -> targetVolume.
   * Called ONLY from a click event handler (browser autoplay policy).
   */
  const startAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    const { targetVolume, fadeInDuration } = letterContent.audio;

    audio.volume = 0;
    audio.muted = false;

    try {
      await audio.play();
    } catch {
      // Autoplay refused / audio file not available yet — the page keeps working.
      setPlaying(false);
      return;
    }

    setPlaying(true);
    clearFade();

    const steps = 40;
    const stepMs = Math.max(16, Math.round(fadeInDuration / steps));
    const increment = targetVolume / steps;
    let current = 0;

    fadeTimer.current = setInterval(() => {
      const node = audioRef.current;
      if (!node) {
        clearFade();
        return;
      }

      current = Math.min(targetVolume, current + increment);
      node.volume = current;

      if (current >= targetVolume) clearFade();
    }, stepMs);
  }, [clearFade]);

  const handleOpen = useCallback(() => {
    void startAudio();
    setView("letter");
    // Make sure the page starts at the top once the transition settles.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [startAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Keep the UI in sync when audio is played/paused from outside this
    // component (system media controls, headphones, backgrounded tab, etc.).
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => clearFade, [clearFade]);

  return (
    <MotionConfig reducedMotion="user">
      <FloatingPetals />

      {/* The single audio source for the whole page */}
      <audio
        ref={audioRef}
        src={letterContent.audio.src}
        loop
        preload="auto"
        playsInline
        className="hidden"
      />

      <main className="relative z-10">
        <noscript>
          <div className="mx-auto max-w-xl px-6 py-16 text-center">
            <h1 className="font-serif text-2xl text-espresso">
              {letterContent.letterTitle}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-espresso/80">
              {letterContent.openingLine}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-espresso/80">
              {letterContent.paragraphs[0]}
            </p>
            <p className="mt-6 text-xs text-espresso/60">
              Enable JavaScript to open the envelope and read the full letter.
            </p>
          </div>
        </noscript>

        <AnimatePresence mode="wait" initial={false}>
          {view === "envelope" ? (
            <EnvelopeIntro
              key="envelope"
              recipientName={letterContent.recipientName}
              hint={letterContent.envelopeHint}
              senderName={letterContent.senderName}
              onOpen={handleOpen}
            />
          ) : (
            <motion.div
              key="letter"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: EASE }}
              className="mx-auto w-full max-w-[46rem] px-5 pt-14 pb-28 sm:px-8 sm:pt-20"
            >
              <LoveLetterBody content={letterContent} />
              <PolaroidGallery memories={letterContent.memories} />
              <ReplySection content={letterContent} />

              <footer className="mt-16 flex flex-col items-center gap-2 border-t border-rose/15 pt-8 text-center">
                <p className="font-hand text-lg text-terracotta-ink">
                  made slowly, with feeling
                </p>
                <p className="text-[10px] tracking-[0.28em] text-espresso/75 uppercase">
                  {letterContent.senderName} × {letterContent.recipientName}
                </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {view === "letter" && (
          <AudioPlayer
            key="player"
            audioRef={audioRef}
            playing={playing}
            onToggle={setPlaying}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
