# Woogigs Inventory CLI

CLI sederhana untuk **menampilkan, mencari, dan update data sparepart** dari API Woogigs Backoffice langsung lewat terminal.

## ✨ Fitur
- Cari item berdasarkan **nama / SKU**
- Tampilkan hasil dalam bentuk **tabel di terminal**
- Update:
  - Nama Part
  - Qty
  - Harga HPP
  - Harga Jual
- Otomatis kirim perubahan ke endpoint `update`

## 📦 Install
```bash
# clone repo
git clone https://github.com/username/woogigs-cli.git
cd woogigs-cli

# install dependencies
npm install

🚀 Cara Pakai

Jalankan:

node woogigs.js


Masukkan keyword pencarian (nama part / SKU).

Pilih item dari tabel.

Edit nama/qty/harga sesuai kebutuhan.

Data akan diupdate ke API.

⚙️ Config

API Select: https://backoffice.woogigs.com/master-item/select

API Update: https://backoffice.woogigs.com/master-item/update

Token: sudah diinject default (67cebdfd4ed4e) di woogigs.js

Kalau token berubah, ubah langsung di:

const TOKEN = "67cebdfd4ed4e";

🖼️ Contoh
Masukkan nama part / SKU untuk dicari: filter

┌──────────┬──────────┬──────────────────────────────┬──────────┬───────────────┬───────────────┐
│ Code     │ SKU      │ Name                         │ Qty      │ Harga HPP     │ Harga Jual    │
├──────────┼──────────┼──────────────────────────────┼──────────┼───────────────┼───────────────┤
│ 123      │ FLT001   │ Filter Oli Avanza            │ 50       │ 30000         │ 45000         │
│ 124      │ FLT002   │ Filter Oli Xenia             │ 40       │ 28000         │ 42000         │
└──────────┴──────────┴──────────────────────────────┴──────────┴───────────────┴───────────────┘


💡 Dibuat dengan Node.js + Inquirer + CLI-Table3 untuk memudahkan manajemen sparepart bengkel langsung via terminal.
