# Product Requirements Document (PRD): Digital Love Letter Website

## 1. Ringkasan Proyek
* **Nama Produk:** *Surat Cinta Digital* (Digital Love Letter)
* **Platform:** Web Application (Responsive: Mobile-first & Desktop)
* **Tech Stack Utama:** Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React
* **Tujuan Utama:** Menyediakan pengalaman digital yang intim, hangat, dan sangat romantis bagi pengguna untuk mengekspresikan rasa rindu dan kasih sayang kepada pasangannya melalui surat interaktif yang diiringi musik latar (*backsound*) dan animasi lembut.

---

## 2. Target Pengguna & Persona
* **Pengirim (User):** Individu yang sedang merasakan rindu mendalam, merayakan hari spesial, atau sekadar ingin memberikan kejutan manis nan personal kepada pasangannya.
* **Penerima (Partner):** Pasangan yang membuka tautan tersebut di ponsel atau laptopnya, mengharapkan pengalaman emosional yang menyentuh hati, estetik, dan terasa eksklusif hanya untuk dirinya.

---

## 3. Desain Visual & Atmosfer (UI/UX)
* **Tema & Nuansa:** *Warm, Intimate, Dreamy, & Timeless Romance*.
* **Palet Warna:**
  * *Background Utama:* Warm Cream / Soft Ivory (`#FDFBF7` atau `#FAF3F0`)
  * *Aksen Utama:* Dusty Rose (`#D48C94`) & Terracotta Soft (`#C86D51`)
  * *Teks Utama:* Deep Charcoal / Warm Espresso (`#3A2E2C`) — menghindari hitam pekat agar mata nyaman dan terasa lembut.
  * *Aksen Emas/Kilau:* Champagne Gold (`#E5C185`)
* **Tipografi:**
  * *Heading / Judul Surat:* Serif klasik & elegan (contoh: *Playfair Display* atau *Cormorant Garamond*).
  * *Isi Surat:* Sans-serif bersih dan mudah dibaca atau Serif lembut (contoh: *Plus Jakarta Sans* atau *Lora*).
  * *Tanda Tangan / Catatan Kecil:* Tulisan tangan / Cursive (contoh: *Caveat* atau *Great Vibes*).

---

## 4. Fitur Utama & Alur Pengalaman Pengguna (User Flow)

### Tahap 1: Gerbang Pembuka (The Envelope / Landing Screen)
* **Tampilan:** Layar penuh dengan ilustrasi/komponen amplop digital berwarna krem dengan segel lilin (*wax seal*) berwarna merah marun/emas di tengahnya.
* **Interaksi:** Teks kecil berbunyi *"Ada pesan rindu khusus untukmu. Ketuk segel untuk membuka..."*
* **Aksi:** Saat segel diketuk:
  1. Animasi segel terbuka dan amplop perlahan terbuka ke atas.
  2. **Audio Trigger:** Musik latar (*backsound*) otomatis mulai berputar dengan efek *fade-in* yang halus (mematuhi aturan *autoplay* browser yang membutuhkan interaksi klik pertama).
  3. Transisi masuk ke halaman utama surat cinta.

### Tahap 2: Kontrol Musik Latar (Floating Audio Player)
* **Tampilan:** Tombol melayang (*floating pill*) minimalis di pojok kanan atas atau bawah dengan ikon piringan hitam/not balok yang berputar pelan saat musik aktif.
* **Fitur:** Tombol *Play/Pause* dan kontrol volume sederhana.
* **Rekomendasi Backsound:** Instrumen piano solo yang lembut, akustik gitar hangat, atau melodi *music box* tanpa vokal agar tidak mengganggu fokus saat membaca.

### Tahap 3: Isi Surat Cinta (Interactive Love Letter)
* **Animasi Teks:** Paragraf muncul secara bertahap (*staggered fade-in* saat di-*scroll* atau efek mesin tik lembut pada kalimat pembuka).
* **Partikel Atmosfer:** Kelopak bunga mawar atau partikel cahaya (*fireflies/bokeh*) melayang perlahan di latar belakang menggunakan Framer Motion.
* **Draf Konten Kata-Kata Romantis (Default Copywriting):**
  > **Judul:** *Untuk Kamu, Rumah dari Segala Rinduku.*
  >
  > **Pembuka:**
  > Hai sayang, kalau kamu lagi buka halaman ini, berarti aku lagi kangen banget sama kamu. Kadang, kata-kata lewat pesan singkat rasanya nggak pernah cukup buat ngewakilin seberapa besar rasa sayangku ke kamu hari ini.
  >
  > **Isi Utama:**
  > Di tengah hari-hari yang kadang melelahkan dan penuh hal yang nggak terduga, mikirin kamu selalu jadi jeda paling tenang buat aku. Terima kasih ya, sudah hadir dan jadi tempat pulang paling nyaman. Terima kasih buat setiap tawa kecil, buat kesabaran kamu, dan buat cara kamu bikin hal-hal sederhana terasa begitu istimewa.
  >
  > Jarak atau kesibukan mungkin sesekali bikin kita nggak bisa ketemu setiap saat. Tapi percayalah, di setiap detik yang berjalan, namamu selalu jadi hal pertama yang terlintas di pikiranku. Aku rindu suaramu, rindu tatapanmu, dan rindu semua cerita kita.
  >
  > **Penutup:**
  > Jaga diri baik-baik ya di sana. Jangan lupa makan, jangan terlalu capek. Aku selalu di sini, mendoakan yang terbaik buatmu, dan selalu jatuh cinta lagi sama kamu setiap harinya.
  >
  > *Peluk jauh penuh rindu,*
  > **[Nama Kamu]**

### Tahap 4: Galeri Kenangan Mini (Polaroid Memories)
* **Tampilan:** 3 hingga 4 foto kenangan berdua yang disusun seperti tumpukan foto Polaroid miring yang estetik.
* **Interaksi:** Saat foto disentuh/di-hover, foto akan tegak lurus, membesar sedikit, dan menampilkan catatan tanggal serta keterangan singkat di bagian bawah bingkai.

### Tahap 5: Kotak "Kirim Balasan Rindu" (Interactive Ending)
* **Tampilan:** Di bagian paling bawah surat, terdapat tombol interaktif bertuliskan *"Aku Juga Kangen Kamu ❤️"*.
* **Interaksi:** Ketika pasangan menekan tombol tersebut:
  1. Muncul ledakan animasi hati (*heart burst* / konfeti kelopak bunga).
  2. Muncul kartu *pop-up* manis bertuliskan: *"Rindumu sudah tersampaikan ke hatiku. Peluk virtual terkirim! 🤗❤️"* beserta tombol opsi untuk langsung membuka WhatsApp dengan teks otomatis (misal: *"Sayang, aku barusan baca suratnya... aku juga kangen banget sama kamu ❤️"*).

---

## 5. Persyaratan Non-Fungsional
* **Performa:** Waktu muat awal (*Initial Load*) di bawah 2 detik. Aset gambar dan audio harus dikompresi dengan baik.
* **Responsivitas:** 100% optimal di layar *smartphone* (mengingat tautan biasanya dikirim via WhatsApp/Instagram dan dibuka lewat HP).
* **Aksesibilitas:** Kontras teks tetap terbaca jelas meskipun terdapat partikel animasi di latar belakang.