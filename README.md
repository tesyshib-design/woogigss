Woogigs CLI Management Tool
Deskripsi
Woogigs CLI Tool adalah sebuah skrip Command-Line Interface (CLI) yang dibuat dengan Node.js untuk berinteraksi dengan API Woogigs. Alat ini bertujuan untuk mempermudah manajemen data master barang, melacak transaksi, dan menganalisis stok langsung dari terminal Anda.

Proyek ini dikembangkan oleh YaelahYuds.

Fitur Utama
Manajemen Barang: Cari dan edit informasi barang seperti nama, HPP, dan harga jual.

Manajemen Stok: Sesuaikan kuantitas (qty) stok barang dengan mudah.

Laporan Penjualan:

Buat laporan penjualan rinci untuk satu barang spesifik dalam rentang tanggal.

Lacak transaksi yang berhasil dan yang dibatalkan (void).

Dapatkan rekapitulasi total penjualan untuk semua barang dalam periode tertentu.

Analisis Stok: Lakukan audit untuk membandingkan stok tercatat di Woogigs dengan stok aktual dan temukan selisihnya.

Ekspor Data: Ekspor seluruh data stok ke dalam format .csv untuk analisis lebih lanjut di Google Sheets atau Excel.

Cek Transaksi: Lihat detail lengkap dari sebuah transaksi berdasarkan nomor notanya.

Prasyarat
Sebelum menjalankan skrip, pastikan Anda telah menginstal:

Node.js (disarankan versi LTS)

NPM (biasanya sudah terinstal bersama Node.js)

Instalasi
Clone Repositori

git clone [https://github.com/nama-anda/nama-repositori-anda.git](https://github.com/nama-anda/nama-repositori-anda.git)
cd nama-repositori-anda

Install Dependensi
Jalankan perintah berikut di terminal untuk menginstal modul yang diperlukan (axios dan qs):

npm install

Konfigurasi Token API

Buka file woogigs_cli_tool.js dengan editor teks.

Cari bagian // --- KONFIGURASI API ---.

Ganti nilai TOKEN dengan token API valid Anda.

const API_CONFIG = {
  BASE_URL: "[https://backoffice.woogigs.com](https://backoffice.woogigs.com)",
  TOKEN: "GANTI_DENGAN_TOKEN_ANDA", // <--- Ganti di sini
};

Simpan file tersebut.

Cara Menjalankan
Setelah instalasi selesai, jalankan skrip dari terminal dengan perintah:

npm start

atau

node woogigs_cli_tool.js

Anda akan disambut dengan menu utama di mana Anda bisa memilih berbagai opsi yang tersedia.
