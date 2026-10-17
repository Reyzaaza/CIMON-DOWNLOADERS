# Cimon Downloader — HTML + Node.js Backend

Website demo downloader dengan tampilan cartoon, warna kuning gradasi, responsif, dan atribusi di footer atas nama **ReyzaDev**.

## Struktur project

```text
cimon-downloader/
├── index.html
├── server.js
├── readme.md
└── package.json
```

## Fitur

- UI cartoon kuning gradasi, responsif untuk HP dan desktop.
- Kategori Media Downloader, Video, Music, Audio, Foto Profil, Link Bypass, Instagram, dan TikTok.
- Tempel URL dari clipboard, validasi URL, status proses, serta daftar tautan hasil.
- Integrasi backend menggunakan `@coflyn/scrapr` yang berasal dari repo/integrasi sebelumnya.
- Copy bio/caption dan rapikan caption diproses lokal di browser.
- Endpoint status backend: `GET /api/health`.
- Pembatasan request sederhana untuk endpoint API.
- Footer lisensi/atribusi: `Website is demo by ReyzaDev`.

## Persyaratan

- Node.js 20 atau lebih baru direkomendasikan.
- npm.
- Akses internet saat menginstal dependensi.

## Menjalankan secara lokal

1. Ekstrak ZIP.
2. Buka terminal pada folder project.
3. Jalankan:

   ```bash
   npm install
   npm start
   ```

4. Buka `http://localhost:3000`.

Untuk mengecek backend, buka `http://localhost:3000/api/health`.

## Deploy ke Render / Railway / VPS

Project ini menggunakan server Express yang berjalan terus-menerus, jadi gunakan hosting Node.js seperti Render Web Service, Railway, atau VPS. Set build/install command ke `npm install`, dan start command ke `npm start`. Port diambil dari environment variable `PORT` jika tersedia.

> **Catatan Vercel:** server Express permanen seperti ini tidak bisa langsung dijalankan sebagai server Node tradisional di Vercel hanya dengan import repo. Untuk Vercel, backend perlu diubah menjadi serverless function atau gunakan hosting backend Node.js terpisah.

## Tentang ekstraksi media

Website dan backend disiapkan agar saling terhubung, tetapi **tidak ada jaminan semua platform selalu bisa diproses**. Nama fungsi dan bentuk respons `@coflyn/scrapr` dapat berbeda antarversi, sementara platform dapat mengubah API, meminta login, membatasi wilayah, atau memblokir scraper. Jika mendapat pesan metode tidak ditemukan, periksa dokumentasi/exports paket yang terpasang lalu sesuaikan fungsi `chooseMethod()` dan `toDownloads()` di `server.js`.

Gunakan hanya konten publik yang Anda miliki atau punya izin untuk mengunduh. Jangan gunakan untuk mengambil data privat, melewati autentikasi, atau melanggar hak cipta/ketentuan platform.

## Atribusi dan lisensi

**Website is demo by ReyzaDev.**

Project ini disediakan sebagai demo edukasi. Nama dan merek platform pihak ketiga adalah milik pemegang hak masing-masing. Kode proyek ini tidak menyiratkan afiliasi atau dukungan resmi dari platform tersebut. Penggunaan dan modifikasi dilakukan dengan tanggung jawab pengguna.
