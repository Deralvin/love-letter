# 💌 Digital Love Letter

An interactive love-letter website: an envelope with a wax seal, a piano
soundtrack that fades in, a letter with animated typography, a polaroid
gallery, and a reply button that bursts hearts and opens WhatsApp.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**,
**Framer Motion**, and **Lucide React**.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Other commands:

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run build`     | Production build                           |
| `npm start`         | Serve the production build                 |
| `npm run lint`      | ESLint                                     |
| `npm run typecheck` | TypeScript, no emit                        |
| `npm run assets`    | Regenerate placeholder photos + soundtrack |

---

## Personalise it (required before sharing)

All copy lives in **`src/data/letterContent.ts`** — nothing is hardcoded in
components.

1. **`recipientName`** — your partner's name or pet name.
2. **`senderName`** — your name (signature & footer).
3. **`whatsappNumber`** — destination number, international format, no `+` or spaces.
4. **`whatsappPrefillText`** — the message pre-filled when the WhatsApp button is tapped.
5. **`paragraphs`**, **`letterTitle`**, **`closingQuote`** — the letter body.
6. **`memories[]`** — caption, date, and tilt angle for each polaroid.

### Replace the photos

Overwrite these files (keep the same filenames, no code changes needed):

```
public/images/memory-1.jpg
public/images/memory-2.jpg
public/images/memory-3.jpg
```

Best ratio: **4:5** (e.g. 900×1125). Keep each file under ~300 KB.

### Replace the soundtrack

Overwrite `public/audio/romantic-piano.mp3` with a song you both love
(MP3, ideally under 3 MB, no vocals so it doesn't compete with reading).
Final volume and fade-in duration are configured in `letterContent.audio`.

### Share preview (WhatsApp / IG)

`public/images/og-cover.jpg` (1200×630) is the link preview image. Also set the
production URL so the metadata resolves to absolute URLs:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://your-letter.vercel.app
```

---

## Structure

```text
src/
├── app/
│   ├── globals.css          # Palette, paper texture, scrollbar, volume slider
│   ├── icon.svg             # Wax-seal favicon
│   ├── layout.tsx           # Fonts (Playfair/Jakarta/Caveat) + OG metadata
│   └── page.tsx             # Envelope <-> letter state, audio fade-in
├── components/
│   ├── EnvelopeIntro.tsx    # Envelope + seal, audio triggered by the click
│   ├── AudioPlayer.tsx      # Floating player: play/pause, mute, volume slider
│   ├── FloatingPetals.tsx   # 16 petal/bokeh particles (deterministic)
│   ├── LoveLetterBody.tsx   # Letter + typewriter + scroll reveal
│   ├── PolaroidGallery.tsx  # Tilted polaroids, straighten on hover/tap
│   └── ReplySection.tsx     # Heart burst + popup + WhatsApp redirect
├── data/
│   └── letterContent.ts     # THE ONLY source of copy
public/
├── audio/romantic-piano.mp3
└── images/{memory-1..3.jpg, og-cover.jpg}
scripts/
├── generate-audio.py        # Synthesises the piano track (numpy + ffmpeg)
└── generate-images.py       # Placeholder photos & og-cover (Pillow)
```

---

## Technical notes

- **Autoplay**: audio is only started inside the seal's click handler
  (`page.tsx` → `startAudio`), then the volume ramps 0 → 0.6 over 2 seconds.
  If the audio file is missing or 404s, the page still works normally.
- **No hydration mismatch**: particle positions come from a fixed-seed PRNG, so
  server and client render identically.
- **Accessibility**: all text passes WCAG AA contrast (≥4.5:1), touch targets
  are ≥44 px, `prefers-reduced-motion` is respected (animations off, full text
  shown), and there's a `<noscript>` fallback.
- **Performance**: particles are capped at 16 elements animating only transform
  and opacity; images are optimised by `next/image` (WebP); the soundtrack is
  ~483 KB.
