# Executive Dashboard Chandra Asri

Situs statis (HTML, CSS, JavaScript biasa). Tidak ada build step.

## Menjalankan di localhost
1. Buka Antigravity, pilih **Open Folder**, lalu pilih folder ini.
2. Buka terminal dan jalankan `npm run dev` (butuh Node.js).
   Alternatif tanpa Node: `npm run dev:py` (butuh Python 3).
3. Buka http://localhost:3000

Font (Raleway dan Open Sans) dimuat dari Google Fonts, jadi perlu internet.
Tanpa internet, tampilan memakai font sans-serif bawaan sistem.

## Struktur
- `index.html`: kerangka halaman
- `css/styles.css`: gaya dan token warna
- `js/app.js`: data, grafik, filter harian, peringatan
- `js/laras.js`: asisten AI Laras (avatar, chat, jawaban demo)
- `assets/`: foto latar, logo, ikon

## Menyambungkan Laras ke AI sungguhan
Di `js/laras.js`, isi `LARAS.endpoint` dengan URL backend Anda. Laras mengirim
`POST {message, context:{range,date,kpis}}` dan mengharapkan `{answer, confidence?}`.
Data grafik di `js/app.js` (fungsi `gen`) masih data contoh; ganti dengan pemanggilan API Anda.

## Contoh prompt untuk agent Antigravity
"Ganti fungsi gen() di js/app.js agar mengambil data dari API saya di /api/production?range=&date=, dan sambungkan Laras ke /api/laras."
