✨ Woogigs Master Item CLI ✨
Alat manajemen barang interaktif dari terminal.

🚀 Tentang Proyek
Proyek ini adalah alat Command-Line Interface (CLI) yang dirancang untuk mempermudah pengelolaan data barang di backoffice Woogigs. Dengan skrip Node.js ini, Anda tidak perlu lagi membuka browser untuk mencari atau mengedit detail barang seperti nama, HPP (Harga Pokok Penjualan), dan harga jual.

🎯 Fitur Unggulan
Pencarian Cepat: Temukan barang instan berdasarkan nama atau SKU.

Pembaruan Fleksibel: Perbarui nama, HPP, dan harga jual barang yang sudah ada dengan mudah.

Interaksi Langsung: Antarmuka terminal yang ramah pengguna, ringkas, dan efisien.

⚙️ Prasyarat
Sebelum memulai, pastikan Anda telah menyiapkan:

Node.js: Pastikan Anda menggunakan versi 14.x atau yang lebih baru.

Token API Woogigs: Dapatkan token Anda dari Woogigs dan letakkan di dalam variabel TOKEN pada skrip.

⚡ Panduan Instalasi & Penggunaan
Clone atau Unduh proyek ini ke komputer Anda.

Buka Terminal di direktori proyek.

Instal dependensi dengan perintah:

npm install

Jalankan skrip dengan perintah:

npm start

Ikuti petunjuk yang muncul di layar untuk berinteraksi dengan API!

📂 Struktur Proyek
/woogigs-master-item-cli
├── node_modules/         # Folder dependensi (dibuat otomatis)
├── .gitignore            # Mengabaikan file yang tidak relevan
├── package.json          # File konfigurasi proyek & dependensi
└── index.js              # 📄 Skrip utama

🙏 Kontribusi
Kami menyambut kontribusi Anda! Jika Anda menemukan bug atau memiliki ide fitur baru, silakan buka issue atau kirim pull request.

⚠️ Catatan Penting
Pencarian Lokal: API select tidak mendukung filter, jadi skrip ini akan mengambil semua data terlebih dahulu sebelum memfilternya secara lokal. Ini mungkin terasa lambat jika Anda memiliki data yang sangat besar.

Payload Lengkap: API update mewajibkan pengiriman semua data barang, bahkan yang tidak berubah. Skrip ini sudah dirancang untuk menangani hal tersebut secara otomatis.

Error Autentikasi: Jika Anda melihat error X-Auth-Token tidak ada, pastikan token API di skrip Anda sudah benar dan belum kedaluwarsa.
