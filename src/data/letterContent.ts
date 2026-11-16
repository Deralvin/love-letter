/**
 * ============================================================
 *  SINGLE SOURCE OF TRUTH FOR THE LETTER
 *  Edit the values below only — never hardcode copy in components.
 * ============================================================
 *  Must-change before sharing:
 *   1. recipientName  -> your partner's name / pet name
 *   2. senderName     -> your name (appears in the signature)
 *   3. whatsappNumber -> your number, international format without "+"
 *   4. memories[].imageUrl -> replace the files in public/images/memory-*.jpg
 *   5. public/audio/romantic-piano.mp3 -> replace with your song
 * ============================================================
 */

export interface LetterMemory {
  id: number;
  imageUrl: string;
  caption: string;
  date: string;
  /** Polaroid tilt in degrees, e.g. -3, 2, -2 */
  rotation: number;
}

export interface LetterConfig {
  recipientName: string;
  senderName: string;
  /** International format, no "+", e.g. '628123456789' */
  whatsappNumber: string;
  whatsappPrefillText: string;
  envelopeHint: string;
  letterTitle: string;
  letterSubtitle: string;
  openingLine: string;
  paragraphs: string[];
  closingQuote: string;
  signatureNote: string;
  memories: LetterMemory[];
  audio: {
    src: string;
    /** Final volume once the fade-in finishes (0 - 1) */
    targetVolume: number;
    /** Fade-in duration in milliseconds */
    fadeInDuration: number;
  };
  reply: {
    buttonLabel: string;
    popupTitle: string;
    popupMessage: string;
    popupNote: string;
    whatsappButtonLabel: string;
  };
}

export const letterContent: LetterConfig = {
  recipientName: "Kiran",
  senderName: "Deral",

  whatsappNumber: "6281572899196",
  whatsappPrefillText:
    "Hey, I just read your letter... and honestly, I miss you so much ❤️",

  envelopeHint:
    "There's a little message written just for you. Tap the seal to open it...",

  letterTitle: "For You, the Home of All My Longing",
  letterSubtitle: "Written slowly, somewhere between missing you and praying for you",

  openingLine:
    "Hi love, if you're reading this page, it means I've been missing you terribly today.",

  paragraphs: [
    "Sometimes words sent through a quick text never feel like enough to carry the size of everything I feel for you.",
    "In the middle of days that wear me out and surprise me in ways I never plan for, thinking about you is always the calmest pause. Thank you for showing up, and for being the most comfortable place to come home to. Thank you for every small laugh, for your patience, and for the way you make the simplest things feel extraordinary.",
    "Distance or busy weeks might keep us apart more often than we'd like. But trust me — in every second that passes, your name is the first thing that crosses my mind. I miss your voice, I miss the way you look at me, and I miss all of our stories.",
    "Take good care of yourself over there, okay? Don't skip meals, don't wear yourself out. I'm always here, wishing the very best for you, and falling in love with you all over again, every single day.",
  ],

  closingQuote: "A long hug full of longing,",

  signatureNote: "— always, yours",

  memories: [
    {
      id: 1,
      imageUrl: "/images/memory-1.jpg",
      caption: "Our first afternoon — even the sky was smiling.",
      date: "February 12, 2023",
      rotation: -3.5,
    },
    {
      id: 2,
      imageUrl: "/images/memory-2.jpg",
      caption: "The coffee you ordered me — always sweetened just right.",
      date: "July 8, 2023",
      rotation: 2.5,
    },
    {
      id: 3,
      imageUrl: "/images/memory-3.jpg",
      caption: "We laughed so hard we forgot the time.",
      date: "December 21, 2024",
      rotation: -1.8,
    },
  ],

  audio: {
    src: "/audio/romantic-piano.mp3",
    targetVolume: 0.6,
    fadeInDuration: 2000,
  },

  reply: {
    buttonLabel: "I Miss You Too",
    popupTitle: "What you feel just reached me",
    popupMessage:
      "A virtual hug has been delivered! If you want, reply on WhatsApp — so I can hear your voice again. 🤗❤️",
    popupNote: "This message is just for the two of us.",
    whatsappButtonLabel: "Reply on WhatsApp",
  },
};
