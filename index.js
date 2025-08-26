/**
 * Skrip CLI (Command-Line Interface) untuk Manajemen Master Barang via API Woogigs.
 * * Fungsi:
 * 1. Mencari barang berdasarkan nama atau SKU.
 * 2. Mengedit nama, HPP (Harga Pokok Penjualan), dan Harga Jual barang yang sudah ada.
 * 3. Menyesuaikan kuantitas (qty) barang dengan penambahan/pengurangan.
 * * Pastikan Anda sudah menginstal modul berikut:
 * - axios: `npm install axios`
 * - qs: `npm install qs`
 * * Jalankan skrip ini dari terminal dengan perintah: `node nama_file_anda.js`
 */

const axios = require("axios");
const readline = require("readline");
const https = require("https");
const qs = require("qs");

// Gunakan agen HTTPS untuk menonaktifkan verifikasi SSL (hanya untuk pengembangan)
const agent = new https.Agent({ rejectUnauthorized: false });

// Ganti nilai TOKEN dengan token API Anda yang sebenarnya.
const TOKEN = "67cebdfd4ed4e";

// Objek untuk mengelola input/output dari terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Fungsi pembantu untuk melakukan panggilan API ke endpoint yang diberikan.
 * Menangani header, payload, dan penanganan kesalahan dasar.
 * @param {string} url - URL API tujuan.
 * @param {object} payload - Data yang akan dikirim dalam body permintaan.
 * @returns {Promise<object>} - Mengembalikan data respons jika berhasil.
 */
async function callApi(url, payload) {
  try {
    // Menambahkan token ke payload sebelum dikirim
    const fullPayload = { ...payload, token: TOKEN };

    const res = await axios.post(
      url,
      qs.stringify(fullPayload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        httpsAgent: agent,
      }
    );
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error("\n❌ Error respons dari server:", err.response.status, err.response.data);
      console.log("Respons gagal:", err.response.data); // Tambahan untuk debugging
      if (err.response.status === 401) {
        console.error("Autentikasi Gagal: Pastikan token Anda benar dan tidak kadaluarsa.");
      }
    } else if (err.request) {
      console.error("\n❌ Error permintaan:", "Tidak ada respons dari server. Periksa koneksi.");
    } else {
      console.error("\n❌ Terjadi kesalahan:", err.message);
    }
    return null;
  }
}

/**
 * Mencari barang berdasarkan kata kunci dan menampilkan hasilnya.
 */
async function searchItems() {
  rl.question("\nMasukkan nama atau SKU barang untuk dicari: ", async (keyword) => {
    console.log("\n⏳ Mencari barang...");
    const url = "https://backoffice.woogigs.com/master-item/select";
    
    // Mengirim payload kosong karena API tidak mendukung filter
    const data = await callApi(url, {});

    // Tambahan untuk menampilkan respons mentah
    console.log("\n✅ Respons Mentah dari API:\n", JSON.stringify(data, null, 2));

    if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
      // Melakukan filter lokal di sisi klien
      const filteredItems = data.data.filter(item => {
        const keywordLower = keyword.trim().toLowerCase();
        // Mencocokkan nama atau SKU secara case-insensitive
        const nameMatch = item.name && item.name.toLowerCase().includes(keywordLower);
        const skuMatch = item.sku && item.sku.toLowerCase().includes(keywordLower);
        return nameMatch || skuMatch;
      });

      if (filteredItems.length > 0) {
        console.log("\n📦 Hasil pencarian:");
        console.log("---");
        filteredItems.forEach((item, i) => {
          // Menampilkan objek item lengkap untuk debugging
          console.log(`Debug: Objek item lengkap #${i + 1}`, item);
          console.log(`SKU: ${item.sku} | Nama: ${item.name} | Kode: ${item.code}`);
          // Menggunakan operator '??' untuk menampilkan 'N/A' jika properti tidak ditemukan
          console.log(`HPP: ${item.price_net ?? 'N/A'} | Harga Jual: ${item.price ?? 'N/A'} | Qty: ${item.qty ?? 'N/A'}`); 
          console.log("---");
        });
      } else {
        console.log("\n⚠️ Tidak ada item ditemukan.");
      }
      mainMenu();
    } else {
      console.log("\n⚠️ Tidak ada item ditemukan atau respons tidak valid.");
      mainMenu();
    }
  });
}

/**
 * MENGUBAH FUNGSI EDIT UNTUK MENGAMBIL DATA LENGKAP SEBELUM PEMBARUAN
 */
async function editItem() {
  rl.question("\nMasukkan CODE (contoh: 1134557) item yang akan diedit: ", async (code) => {
    const itemCode = code.trim();
    if (!itemCode) {
      console.log("Code tidak boleh kosong.");
      mainMenu();
      return;
    }

    // Langkah 1: Ambil data item saat ini
    console.log(`\n⏳ Mengambil data item dengan kode: ${itemCode}...`);
    const selectUrl = "https://backoffice.woogigs.com/master-item/select";
    const allData = await callApi(selectUrl, {});

    if (!allData || !allData.success || !Array.isArray(allData.data)) {
        console.log("❌ Gagal mendapatkan data item. Silakan coba lagi.");
        mainMenu();
        return;
    }

    const itemToUpdate = allData.data.find(item => item.code.toString() === itemCode);
    if (!itemToUpdate) {
        console.log("⚠️ Item tidak ditemukan.");
        mainMenu();
        return;
    }

    console.log(`\n✅ Item ditemukan! Data saat ini:`);
    console.log(`Nama: ${itemToUpdate.name}`);
    console.log(`HPP: ${itemToUpdate.price_net ?? 'N/A'}`);
    console.log(`Harga Jual: ${itemToUpdate.price ?? 'N/A'}`);
    console.log(`Qty: ${itemToUpdate.qty ?? 'N/A'}`);
    console.log("---");

    // Langkah 2: Minta input data baru dari pengguna
    rl.question(`Masukkan Nama Barang baru (kosongkan jika tidak berubah): `, (name) => {
      rl.question(`Masukkan HPP baru (kosongkan jika tidak berubah): `, (hpp) => {
        rl.question(`Masukkan Harga Jual baru (kosongkan jika tidak berubah): `, async (hargaJual) => {
          const url = "https://backoffice.woogigs.com/master-item/update";
          
          // Langkah 3: Buat payload dengan data lama dan data baru
          const payload = {
            code: itemToUpdate.code,
            sku: itemToUpdate.sku,
            code_custom: itemToUpdate.code_custom,
            name: name.trim() || itemToUpdate.name,
            category_code: itemToUpdate.category_code,
            formula: itemToUpdate.formula,
            stock: itemToUpdate.stock,
            unit: itemToUpdate.unit,
            unit_code: itemToUpdate.unit_code,
            price_net: hpp.trim() || itemToUpdate.price_net,
            price: hargaJual.trim() || itemToUpdate.price,
            qty: itemToUpdate.qty,
            qty_alert: itemToUpdate.qty_alert,
            notes: itemToUpdate.notes,
            show_online_store: itemToUpdate.show_online_store,
            recommendation: itemToUpdate.recommendation,
            prevent_favorite: itemToUpdate.prevent_favorite,
            // Tambahkan semua properti lain yang ada di objek itemToUpdate
            ...itemToUpdate,
            // Nilai baru akan menimpa nilai lama
            name: name.trim() || itemToUpdate.name,
            price_net: hpp.trim() || itemToUpdate.price_net,
            price: hargaJual.trim() || itemToUpdate.price,
          };

          console.log("\n⏳ Mengirim data update...");
          console.log("Payload yang dikirim:", payload);
          const data = await callApi(url, payload);

          if (data && data.success) {
            console.log("\n✅ Sukses:", data.message);
          } else {
            console.log("\n❌ Gagal mengedit item.");
            console.log("Respons gagal:", data);
          }
          mainMenu();
        });
      });
    });
  });
}

/**
 * MENGUBAH FUNGSI BARU UNTUK MENYESUAIKAN KUANTITAS
 */
async function adjustQty() {
    rl.question("\nMasukkan CODE item yang akan disesuaikan: ", async (code) => {
        const itemCode = code.trim();
        if (!itemCode) {
            console.log("Code tidak boleh kosong.");
            mainMenu();
            return;
        }

        console.log(`\n⏳ Mengambil data item dengan kode: ${itemCode}...`);
        const selectUrl = "https://backoffice.woogigs.com/master-item/select";
        const allData = await callApi(selectUrl, {});

        if (!allData || !allData.success || !Array.isArray(allData.data)) {
            console.log("❌ Gagal mendapatkan data item. Silakan coba lagi.");
            mainMenu();
            return;
        }

        const itemToUpdate = allData.data.find(item => item.code.toString() === itemCode);
        if (!itemToUpdate) {
            console.log("⚠️ Item tidak ditemukan.");
            mainMenu();
            return;
        }

        console.log(`\n✅ Item ditemukan! Stok saat ini: ${itemToUpdate.qty}`);
        console.log("---");

        rl.question("Masukkan jumlah penyesuaian (contoh: 5.5): ", (adjustment) => {
            const adjustmentValue = parseFloat(adjustment.trim());
            if (isNaN(adjustmentValue)) {
                console.log("⚠️ Jumlah penyesuaian harus berupa angka.");
                mainMenu();
                return;
            }

            rl.question("Pilih operasi (+/-): ", async (operation) => {
                let newQty = parseFloat(itemToUpdate.qty);

                if (operation.trim() === '+') {
                    newQty += adjustmentValue;
                } else if (operation.trim() === '-') {
                    newQty -= adjustmentValue;
                } else {
                    console.log("⚠️ Operasi tidak valid. Gunakan '+' atau '-'.");
                    mainMenu();
                    return;
                }

                const url = "https://backoffice.woogigs.com/master-item/update";
                const payload = {
                    ...itemToUpdate,
                    qty: newQty
                };

                console.log("\n⏳ Mengirim pembaruan kuantitas...");
                console.log("Payload yang dikirim:", payload);
                const data = await callApi(url, payload);

                if (data && data.success) {
                    console.log("\n✅ Sukses:", data.message);
                } else {
                    console.log("\n❌ Gagal mengedit kuantitas.");
                    console.log("Respons gagal:", data);
                }
                mainMenu();
            });
        });
    });
}

/**
 * Fungsi menu utama yang menampilkan opsi kepada pengguna.
 */
function mainMenu() {
  const green = "\x1b[32m";
  const cyan = "\x1b[36m";
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";

  const boxWidth = 50; // Menetapkan lebar kotak tetap
  
  // Fungsi untuk mendapatkan lebar string visual, mengabaikan kode warna
  const getVisualWidth = (str) => {
    // Menghapus semua kode warna ANSI dari string
    const cleanedStr = str.replace(/\x1b\[[0-9;]*m/g, '');
    return cleanedStr.length;
  };
  
  // Fungsi untuk memusatkan teks dengan padding yang benar
  const centerText = (text, width) => {
    const visualWidth = getVisualWidth(text);
    const padding = Math.max(0, width - visualWidth);
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
  };

  const menuTitle = "SISTEM MANAJEMEN BARANG";
  const author = `Developed by YaelahYuds`;
  const project = `Project: Woogigs CLI v1.0`;

  console.log(`\n\n${green}+${'-'.repeat(boxWidth-2)}+${reset}`);
  console.log(`${green}|${centerText(`${cyan}SERENDIPITY${reset}`, boxWidth - 2)}${green}|${reset}`);
  console.log(`${green}|${centerText(`${cyan}${author}${reset}`, boxWidth - 2)}${green}|${reset}`);
  console.log(`${green}|${centerText(`${cyan}${project}${reset}`, boxWidth - 2)}${green}|${reset}`);
  console.log(`${green}+${'-'.repeat(boxWidth-2)}+${reset}`);
  console.log(`${green}| ${yellow}PILIH OPSI:${reset}${' '.repeat(boxWidth-12-1)}${green}|${reset}`);
  console.log(`${green}|${' '.repeat(boxWidth-2)}${green}|${reset}`);
  console.log(`${green}| ${cyan}1. ${reset}Cari Barang${' '.repeat(boxWidth-15-1)}${green}|${reset}`);
  console.log(`${green}| ${cyan}2. ${reset}Edit Barang${' '.repeat(boxWidth-15-1)}${green}|${reset}`);
  console.log(`${green}| ${cyan}3. ${reset}Sesuaikan Qty${' '.repeat(boxWidth-17-1)}${green}|${reset}`);
  console.log(`${green}| ${cyan}4. ${reset}Keluar${' '.repeat(boxWidth-10-1)}${green}|${reset}`);
  console.log(`${green}+${'-'.repeat(boxWidth-2)}+${reset}`);
  
  rl.question(`${cyan}>>> ${reset}Masukkan pilihan Anda: `, (option) => {
    switch (option.trim()) {
      case "1":
        searchItems();
        break;
      case "2":
        editItem();
        break;
      case "3":
        adjustQty();
        break;
      case "4":
        console.log(`\n${green}[ Selesai ]${reset} Terima kasih, sampai jumpa!`);
        rl.close();
        break;
      default:
        console.log(`${yellow}Opsi tidak valid.${reset} Silakan coba lagi.`);
        mainMenu();
        break;
    }
  });
}

// Mulai skrip dengan menampilkan menu utama
mainMenu();
