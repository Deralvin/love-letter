"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Disc3, Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type AudioPlayerProps = {
  /** The page-owned audio element (created in page.tsx) */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  playing: boolean;
  /** Called after the audio element state has already changed */
  onToggle: (next: boolean) => void;
  label?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Floating pill player: play/pause + a simple volume control.
 * The source of truth for state stays in page.tsx (`playing`); this component
 * only translates interactions into play()/pause()/volume on the audio element.
 */
export default function AudioPlayer({
  audioRef,
  playing,
  onToggle,
  label = "Background music",
}: AudioPlayerProps) {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [panelOpen, setPanelOpen] = useState(false);
  const lastVolume = useRef(0.6);

  // Keep the slider in sync with the audio element (the fade-in changes it slowly).
  useEffect(() => {
    if (!panelOpen) return;
    const id = setInterval(() => {
      const node = audioRef.current;
      if (!node) return;
      setVolume(node.muted ? 0 : node.volume);
      setMuted(node.muted);
    }, 250);
    return () => clearInterval(id);
  }, [audioRef, panelOpen]);

  const togglePlay = useCallback(async () => {
    const node = audioRef.current;
    if (!node) return;

    if (node.paused) {
      try {
        await node.play();
        onToggle(true);
      } catch {
        onToggle(false);
      }
    } else {
      node.pause();
      onToggle(false);
    }
  }, [audioRef, onToggle]);

  const toggleMute = useCallback(() => {
    const node = audioRef.current;
    if (!node) return;
    const next = !node.muted;
    node.muted = next;
    setMuted(next);
    setVolume(next ? 0 : node.volume);
  }, [audioRef]);

  const changeVolume = useCallback(
    (value: number) => {
      const node = audioRef.current;
      setVolume(value);
      if (!node) return;

      node.volume = value;
      if (value > 0) lastVolume.current = value;

      // Volume 0 means muted; raising the volume un-mutes.
      const shouldMute = value === 0;
      node.muted = shouldMute;
      setMuted(shouldMute);
    },
    [audioRef],
  );

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.4 ? Volume1 : Volume2;

  return (
    <motion.div
      className="fixed right-4 bottom-5 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-7"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
    >
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="flex w-56 items-center gap-3 rounded-2xl border border-rose/30 bg-cream/95 px-4 py-3 shadow-[0_14px_34px_-16px_rgba(58,46,44,0.45)] backdrop-blur-md"
          >
            <span className="text-[10px] font-semibold tracking-[0.16em] text-espresso/75 uppercase">
              {playing ? "Music ♪" : "Paused"}
            </span>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => changeVolume(Number(event.target.value))}
              aria-label="Music volume"
              className="volume-slider flex-1"
              style={
                { "--range-progress": `${volume * 100}%` } as React.CSSProperties
              }
            />

            <span className="w-7 text-right text-[10px] font-semibold text-espresso/70 tabular-nums">
              {Math.round(volume * 100)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 rounded-full border border-rose/30 bg-cream/85 p-1 shadow-[0_14px_34px_-16px_rgba(58,46,44,0.45)] backdrop-blur-md">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause music" : "Play music"}
          aria-pressed={playing}
          className="group flex min-h-11 items-center gap-2 rounded-full bg-espresso/95 px-4 py-3 text-cream transition-colors hover:bg-espresso focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 focus-visible:ring-offset-cream focus-visible:outline-none sm:py-2.5"
        >
          <motion.span
            className="grid place-items-center"
            animate={playing ? { rotate: 360 } : { rotate: 0 }}
            transition={
              playing
                ? { duration: 6, repeat: Infinity, ease: "linear" }
                : { duration: 0.4, ease: "easeOut" }
            }
          >
            <Disc3 className="size-4" strokeWidth={1.7} />
          </motion.span>

          <span className="relative grid size-3.5 place-items-center">
            <AnimatePresence mode="wait" initial={false}>
              {playing ? (
                <motion.span
                  key="pause"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute"
                >
                  <Pause className="size-3.5" strokeWidth={2} />
                </motion.span>
              ) : (
                <motion.span
                  key="play"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute"
                >
                  <Play className="size-3.5" strokeWidth={2} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>

          <span className="hidden text-[11px] font-semibold tracking-[0.14em] uppercase sm:block">
            {playing ? "Pause" : "Play"}
          </span>
        </button>

        <button
          type="button"
          onClick={toggleMute}
          onDoubleClick={() => changeVolume(lastVolume.current || 0.6)}
          aria-label={muted ? "Unmute music" : "Mute music"}
          aria-pressed={muted}
          className="grid size-11 place-items-center rounded-full text-espresso/75 transition-colors hover:bg-rose/12 hover:text-terracotta-ink focus-visible:ring-2 focus-visible:ring-rose focus-visible:outline-none"
        >
          <VolumeIcon className="size-4" strokeWidth={1.8} />
        </button>

        <button
          type="button"
          onClick={() => setPanelOpen((prev) => !prev)}
          aria-label="Adjust music volume"
          aria-expanded={panelOpen}
          className="grid size-11 place-items-center rounded-full text-espresso/75 transition-colors hover:bg-rose/12 hover:text-terracotta-ink focus-visible:ring-2 focus-visible:ring-rose focus-visible:outline-none"
        >
          <motion.span
            animate={{ rotate: panelOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="grid place-items-center"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 15 6-6 6 6" />
            </svg>
          </motion.span>
        </button>

        <span className="sr-only">{label}</span>
      </div>
    </motion.div>
  );
}
