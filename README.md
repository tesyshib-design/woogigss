Woogigs Master Item CLI
Proyek ini adalah alat Command-Line Interface (CLI) berbasis Node.js untuk berinteraksi dengan API manajemen barang di backoffice Woogigs. Dengan alat ini, Anda dapat mencari barang dan memperbarui detailnya, seperti nama, HPP (Harga Pokok Penjualan), dan harga jual, langsung dari terminal.

Fitur Utama
Pencarian Barang: Cari item berdasarkan nama atau SKU. Karena keterbatasan API, pencarian dilakukan secara lokal pada skrip setelah mengambil semua data.

Pembaruan Data: Edit nama, HPP, dan harga jual untuk item yang sudah ada. Skrip secara otomatis mengambil data lengkap item yang diperlukan oleh API update.

Interaktif: Antarmuka berbasis teks yang mudah digunakan di terminal.

Prasyarat
Pastikan Anda telah menginstal lingkungan berikut di komputer Anda:

Node.js: Versi 14.x atau yang lebih baru.

npm: Node Package Manager (termasuk dalam instalasi Node.js).

Token API Woogigs: Diperlukan untuk otentikasi. Token ini harus diletakkan dalam variabel TOKEN di dalam skrip.

Instalasi
Clone repositori ini atau buat folder baru dan salin file-file proyek.

Buka terminal di folder proyek.

Jalankan perintah berikut untuk menginstal dependensi yang diperlukan (axios dan qs):

npm install

Cara Menjalankan Skrip
Pastikan TOKEN di dalam file index.js (atau nama file skrip Anda) telah diisi dengan token API yang benar.

Jalankan skrip dari terminal dengan perintah:

node index.js

Ikuti petunjuk di layar untuk mencari atau mengedit barang.

Struktur Proyek
/nama-folder-proyek-anda
├── node_modules/         # Folder untuk dependensi (otomatis dibuat)
├── .gitignore            # File untuk mengabaikan folder node_modules
├── package.json          # File untuk mengelola dependensi proyek
└── index.js              # File skrip utama (kode yang telah Anda buat)

Kontribusi
Kami menerima kontribusi! Jika Anda menemukan bug atau memiliki saran perbaikan, silakan buat issue atau pull request.

Catatan
API select tidak mendukung filter, sehingga skrip akan mengambil semua data terlebih dahulu, lalu memfilternya secara lokal. Hal ini mungkin lambat jika data sangat besar.

API update membutuhkan semua kunci data barang (seperti SKU, kategori, unit, dll.) dikirimkan kembali, bahkan jika tidak diubah. Skrip ini telah dirancang untuk menangani hal tersebut secara otomatis.

Jika Anda mengalami masalah autentikasi (X-Auth-Token tidak ada), pastikan token di index.js sudah benar dan tidak kadaluarsa.
