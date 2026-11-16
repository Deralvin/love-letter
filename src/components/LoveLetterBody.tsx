"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LetterConfig } from "@/data/letterContent";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Gentle typewriter effect for the opening line (starts when in view). */
function TypewriterLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Respect the "reduce motion" preference: no animation at all.
    if (!inView || reduceMotion) return;

    const controls = animate(0, text.length, {
      duration: Math.min(2.6, text.length * 0.022),
      delay,
      ease: "linear",
      onUpdate: (value) => setCount(Math.round(value)),
    });

    return () => controls.stop();
  }, [text, delay, inView, reduceMotion]);

  // Derived during render (not via setState in an effect) to avoid
  // cascading renders — see react-hooks/set-state-in-effect.
  const shown = reduceMotion ? text.length : count;
  const done = shown >= text.length;

  return (
    <p
      ref={ref}
      className="font-hand text-xl leading-relaxed text-terracotta-ink sm:text-2xl"
    >
      {/* The in-progress text is hidden from screen readers so it is not read
          twice; the full sentence lives in the sr-only span below. */}
      <span aria-hidden>{text.slice(0, shown)}</span>
      <motion.span
        aria-hidden
        className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.12em] bg-terracotta-ink/80"
        animate={{ opacity: done ? 0 : [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: done ? 0 : Infinity }}
      />
      <span className="sr-only">{text}</span>
    </p>
  );
}

/** Reveal wrapper, triggered once when the element enters the viewport. */
function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function LoveLetterBody({
  content,
}: {
  content: LetterConfig;
}) {
  return (
    <article className="relative w-full">
      {/* Paper card */}
      <div className="relative overflow-hidden rounded-[18px] border border-rose/20 bg-white/78 px-5 py-10 shadow-[0_40px_90px_-50px_rgba(58,46,44,0.55)] backdrop-blur-sm sm:px-12 sm:py-14">
        {/* Corner ornament */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[18px] border border-gold/25"
          style={{ margin: "9px" }}
        />

        <Reveal>
          <p className="text-[10px] font-semibold tracking-[0.36em] text-terracotta-ink uppercase">
            A letter for {content.recipientName}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mt-5 font-serif text-[1.7rem] leading-[1.25] text-espresso sm:text-[2.5rem]">
            {content.letterTitle}
          </h1>
        </Reveal>

        <motion.div
          className="mt-4 h-px w-full origin-left bg-gradient-to-r from-terracotta/45 via-rose/25 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
        />

        <Reveal delay={0.12}>
          <p className="mt-4 font-serif text-sm italic text-espresso/70">
            {content.letterSubtitle}
          </p>
        </Reveal>

        <div className="mt-9">
          <TypewriterLine text={content.openingLine} delay={0.5} />
        </div>

        <div className="mt-8 space-y-6">
          {content.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 24)} delay={index * 0.06}>
              <p className="text-[15px] leading-[1.95] text-espresso/85 sm:text-[16.5px]">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Closing & signature */}
        <Reveal delay={0.1} className="mt-11">
          <p className="font-serif text-base italic text-espresso/80 sm:text-lg">
            {content.closingQuote}
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-4 flex items-end gap-3">
          <Heart className="mb-2 size-4 fill-rose text-rose" strokeWidth={1.4} />
          <div>
            <p className="font-hand text-3xl leading-none text-espresso sm:text-4xl">
              {content.senderName}
            </p>
            <p className="mt-2 text-[11px] tracking-[0.18em] text-espresso/75 uppercase">
              {content.signatureNote}
            </p>
          </div>
        </Reveal>
      </div>
    </article>
  );
}
