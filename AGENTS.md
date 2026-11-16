# AGENTS.md — Panduan Pengembangan & Arsitektur Kode

Dokumen ini berfungsi sebagai instruksi teknis dan standar kode bagi AI Coding Agent maupun developer manusia dalam membangun website **Surat Cinta Digital** menggunakan **Next.js**.

---

## 1. Tech Stack & Lingkungan Kerja
* **Framework:** Next.js 14+ atau 15+ (Wajib menggunakan **App Router** `src/app/`).
* **Bahasa:** TypeScript (`.tsx`, `.ts`) dengan *strict typing*.
* **Styling:** Tailwind CSS.
* **Animasi:** `framer-motion` (Wajib untuk transisi amplop, *scroll reveal*, dan partikel melayang).
* **Ikon:** `lucide-react`.
* **Font Optimization:** Gunakan `next/font/google` (`Playfair_Display`, `Plus_Jakarta_Sans`, dan `Caveat`).

---

## 2. Struktur Direktori Standar
Pastikan struktur folder tetap bersih, modular, dan mudah dikustomisasi:

```text
src/
├── app/
│   ├── globals.css          # Konfigurasi Tailwind & custom scrollbar/animasi halus
│   ├── layout.tsx           # Konfigurasi font Google & Metadata (OpenGraph untuk preview WA)
│   └── page.tsx             # Halaman utama (State management: Envelope vs Letter View)
├── components/
│   ├── EnvelopeIntro.tsx    # Layar pembuka amplop interaktif & pemicu audio
│   ├── AudioPlayer.tsx      # Kontrol pemutar musik latar melayang (Play/Pause)
│   ├── FloatingPetals.tsx   # Efek partikel kelopak bunga/cahaya di latar belakang
│   ├── LoveLetterBody.tsx   # Konten utama surat dengan animasi tipografi bertahap
│   ├── PolaroidGallery.tsx  # Komponen foto kenangan bergaya Polaroid interaktif
│   └── ReplySection.tsx     # Tombol "Aku Juga Kangen" + efek ledakan hati + redirect WA
├── data/
│   └── letterContent.ts     # File terpusat berisi teks surat, daftar foto, & nomor WA tujuan
public/
├── audio/
│   └── romantic-piano.mp3   # File audio backsound romantis (harus ringan < 3MB)
└── images/
    ├── memory-1.jpg         # Foto kenangan 1
    ├── memory-2.jpg         # Foto kenangan 2
    └── memory-3.jpg         # Foto kenangan 3
```

---

## 3. Aturan Implementasi Teknis (Strict Rules)

### A. Manajemen Audio (`AudioPlayer.tsx` & `EnvelopeIntro.tsx`)
* **Browser Autoplay Policy:** Jangan memutar `<audio>` secara otomatis saat halaman pertama kali dimuat (`mount`), karena browser modern akan memblokirnya.
* **Solusi:** Gunakan `useRef<HTMLAudioElement>(null)` di `page.tsx`. Trigger `audioRef.current.play()` **hanya** di dalam fungsi *event handler* `onClick` saat pengguna mengetuk segel amplop di `EnvelopeIntro.tsx`.
* **Fade-In Audio:** Atur volume awal ke `0`, lalu naikkan secara bertahap menggunakan `setInterval` hingga mencapai volume `0.6` dalam 2 detik agar musik masuk dengan lembut.

### B. Animasi & Performa (`framer-motion`)
* **Client Components:** Setiap komponen yang menggunakan *hooks* (`useState`, `useEffect`, `useRef`) atau `framer-motion` wajib menyertakan direktif `'use client';` di baris paling atas.
* **Smoothness:** Gunakan kurva *easing* yang lembut seperti `[0.22, 1, 0.36, 1]` (*ease-out quint*) untuk membuka amplop dan memunculkan teks. Hindari animasi yang memantul terlalu keras (*bouncy*) agar nuansa romantis tetap elegan.
* **Partikel Latar (`FloatingPetals.tsx`):** Batasi jumlah elemen partikel maksimal 15–20 elemen saja menggunakan CSS/Framer Motion agar tidak membebani GPU perangkat seluler. Pastikan properti CSS `pointer-events-none` aktif pada layer partikel agar tidak menghalangi klik pengguna.

### C. Sentralisasi Konten (`src/data/letterContent.ts`)
* Jangan menaruh teks surat atau URL gambar secara *hardcode* di dalam komponen UI.
* Pisahkan seluruh konfigurasi personalisasi ke dalam `src/data/letterContent.ts` dengan struktur tipe data berikut:
  ```typescript
  export interface LetterConfig {
    recipientName: string;
    senderName: string;
    whatsappNumber: string; // Format internasional tanpa '+', misal: '628123456789'
    whatsappPrefillText: string;
    envelopeHint: string;
    letterTitle: string;
    paragraphs: string[];
    closingQuote: string;
    memories: {
      id: number;
      imageUrl: string;
      caption: string;
      date: string;
      rotation: number; // Derajat kemiringan polaroid, misal: -3, 2, -2
    }[];
  }
  ```

### D. SEO & Social Share Preview (`src/app/layout.tsx`)
* Karena tautan website ini akan dibagikan melalui WhatsApp/Instagram, konfigurasi `Metadata` di `layout.tsx` harus dibuat misterius namun manis (tanpa membocorkan isi surat sebelum dibuka):
  * `title`: `"Ada Sesuatu Untukmu 💌"`
  * `description`: `"Sebuah pesan kecil yang kutulis saat sedang merindukanmu."`

---

## 4. Instruksi Pengerjaan Langkah demi Langkah (Untuk AI Agent)
Jika diminta untuk membangun proyek ini dari awal, ikuti urutan eksekusi berikut:
1. Inisialisasi dependensi (`framer-motion`, `lucide-react`) dan pastikan konfigurasi Tailwind siap.
2. Buat `src/data/letterContent.ts` terlebih dahulu dengan kata-kata romantis yang sudah disetujui di `PRD.md`.
3. Setup font dan palet warna hangat di `src/app/layout.tsx` dan `src/app/globals.css`.
4. Bangun komponen secara berurutan: `FloatingPetals` -> `AudioPlayer` -> `EnvelopeIntro` -> `LoveLetterBody` -> `PolaroidGallery` -> `ReplySection`.
5. Rakit seluruh alur di `src/app/page.tsx` dengan transisi `<AnimatePresence mode="wait">` antara tampilan amplop dan tampilan isi surat.
6. Pastikan tidak ada *hydration error* (terutama jika menggunakan posisi acak untuk partikel bunga, gunakan nilai deterministik atau generate di dalam `useEffect`).