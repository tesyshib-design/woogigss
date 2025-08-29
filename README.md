🛠️ Woogigs CLI Management Tool 🛠️
Asisten andal Anda untuk mengelola inventaris Woogigs langsung dari terminal!

Ini adalah sebuah skrip Command-Line Interface (CLI) yang dibuat dengan Node.js untuk berinteraksi langsung dengan API Woogigs. Alat ini dirancang untuk menyederhanakan dan mempercepat proses manajemen data barang, pelacakan transaksi, dan audit stok tanpa perlu membuka back-office.

Dikembangkan oleh YaelahYuds.

✨ Fitur Unggulan
📦 Manajemen Barang: Cari & edit informasi barang seperti nama, HPP, dan harga jual.

📊 Manajemen Stok: Sesuaikan kuantitas (qty) stok barang dengan mudah.

📈 Laporan Penjualan:

Buat laporan penjualan rinci untuk satu barang dalam rentang tanggal.

Lacak transaksi yang berhasil dan yang dibatalkan (void).

Dapatkan rekapitulasi total penjualan untuk semua barang.

🔍 Analisis Stok: Lakukan audit untuk membandingkan stok tercatat di Woogigs dengan stok aktual dan temukan selisihnya secara otomatis.

🧾 Cek Transaksi: Lihat detail lengkap dari sebuah transaksi berdasarkan nomor notanya.

💾 Ekspor Data: Ekspor seluruh data stok ke dalam format .csv untuk dianalisis lebih lanjut di Google Sheets atau Excel.

🚀 Instalasi & Persiapan
Prasyarat
Node.js (disarankan versi LTS)

NPM (otomatis terinstal bersama Node.js)

Langkah-langkah
Clone Repositori

git clone [https://github.com/nama-anda/nama-repositori-anda.git](https://github.com/nama-anda/nama-repositori-anda.git)
cd nama-repositori-anda

Install Dependensi
Jalankan perintah ini untuk menginstal semua modul yang dibutuhkan:

npm install

Konfigurasi Token API

Buka file woogigs_cli_tool.js.

Ganti nilai TOKEN di dalam API_CONFIG dengan token API valid Anda.

const API_CONFIG = {
  BASE_URL: "[https://backoffice.woogigs.com](https://backoffice.woogigs.com)",
  TOKEN: "GANTI_DENGAN_TOKEN_ANDA", // <--- Ganti di sini
};

Simpan file.

💻 Cara Menjalankan
Setelah semua persiapan selesai, jalankan skrip dari terminal dengan perintah:

npm start

Anda akan disambut dengan menu utama. Cukup masukkan nomor opsi yang ingin Anda jalankan dan ikuti petunjuknya.
