/**
 * Skrip CLI (Command-Line Interface) untuk Manajemen Master Barang via API Woogigs.
 * Versi Revisi dengan Perbaikan dan Fitur Tambahan.
 *
 * Changelog:
 * - Refaktor: Konfigurasi API terpusat (BASE_URL, TOKEN).
 * - Perbaikan: Payload pada fungsi editItem dibuat lebih ringkas dan jelas.
 * - Peningkatan: Fungsi laporan dibuat lebih tangguh dengan validasi data dan logging.
 * - Perbaikan Bug: Memperbaiki format tanggal untuk menangani zona waktu dengan benar.
 * - Peningkatan UI: Menu utama dan output yang lebih rapi dan informatif.
 * - [UPDATE] Menu #4 diubah menjadi Laporan Rinci Penjualan per Barang (termasuk plat nomor).
 * - [UPDATE] Menu #5 diubah menjadi Laporan Penjualan Bulanan (Semua Item).
 * - [FIX] Penanganan respons API yang kosong pada fungsi laporan (Menu #4 & #5).
 * - [FITUR BARU] Menambahkan Menu #6 untuk Cek Detail Nota menggunakan endpoint `/transaction/detail`.
 * - [DEBUG] Menambahkan logging error yang lebih detail pada fungsi callApi.
 * - [FIX] Mengubah format tanggal pada fungsi laporan untuk menyertakan waktu (HH:mm:ss).
 * - [UPDATE] Mengembalikan input laporan ke rentang tanggal (dari tanggal-ke-tanggal).
 * - [FIX] Menambahkan parser JSON di callApi untuk menangani respons API berupa string.
 * - [FIX] Memperbaiki nama key dari 'details' menjadi 'detail' sesuai struktur API.
 * - [IMPROVEMENT] Logika deteksi plat nomor pada laporan disempurnakan.
 * - [FITUR BARU] Laporan Rinci Penjualan (Menu #4) sekarang memisahkan dan menyorot transaksi yang dibatalkan (void).
 * - [FITUR BARU] Menambahkan highlight kuning pada transaksi berhasil yang plat mobilnya pernah dibatalkan.
 * - [FITUR BARU] Laporan Rinci Penjualan (Menu #4) kini menampilkan stok awal dan stok akhir periode.
 * - [FITUR BARU] Menambahkan Menu #7 untuk analisis selisih stok secara otomatis.
 * - [FITUR BARU] Menambahkan Menu #8 untuk mengekspor seluruh data stok ke file CSV untuk analisis.
 *
 * * Fungsi:
 * 1. Mencari barang berdasarkan nama atau SKU.
 * 2. Mengedit nama, HPP, dan Harga Jual barang.
 * 3. Menyesuaikan kuantitas (qty) barang.
 * 4. Membuat laporan penjualan rinci untuk satu item spesifik dalam rentang tanggal.
 * 5. Membuat laporan rekap penjualan untuk semua item dalam rentang tanggal.
 * 6. Mengecek rincian item pada satu nota transaksi.
 * 7. Menganalisis selisih stok antara data Woogigs dan data aktual.
 * 8. Mengekspor semua data stok ke file CSV.
 *
 * * Prasyarat:
 * - Node.js
 * - Modul: `npm install axios qs`
 *
 * * Jalankan: `node woogigs_cli_tool.js`
 */

const axios = require("axios");
const readline = require("readline");
const https = require("https");
const qs = require("qs");
const fs = require("fs"); // [BARU] Modul File System untuk menulis file

// --- KONFIGURASI API ---
const API_CONFIG = {
  BASE_URL: "https://backoffice.woogigs.com",
  // PENTING: Ganti dengan token API Anda yang valid.
  TOKEN: "67cebdfd4ed4e",
};
// --------------------

// Gunakan agen HTTPS untuk menonaktifkan verifikasi SSL (hanya untuk pengembangan)
const agent = new https.Agent({ rejectUnauthorized: false });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Fungsi utama untuk melakukan panggilan API.
 * @param {string} endpoint - Endpoint API (contoh: "/master-item/select").
 * @param {object} payload - Data yang akan dikirim.
 * @returns {Promise<object|null>} - Mengembalikan data respons jika berhasil, atau null jika gagal.
 */
async function callApi(endpoint, payload) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  try {
    const fullPayload = { ...payload, token: API_CONFIG.TOKEN };
    
    // console.log(`\n[DEBUG] Mengirim request ke: ${url}`);
    // console.log(`[DEBUG] Dengan payload:`, fullPayload);

    const res = await axios.post(url, qs.stringify(fullPayload), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      httpsAgent: agent,
    });
    
    let responseData = res.data;
    // [FIX] Cek jika respons adalah string, lalu coba parse sebagai JSON.
    if (typeof responseData === 'string') {
        try {
            responseData = JSON.parse(responseData);
        } catch (e) {
            console.error('\n❌ Gagal mem-parsing respons JSON dari server. Respons mentah:', responseData);
            return null;
        }
    }
    
    if (responseData && responseData.success === false) {
        console.error(`\n⚠️ Peringatan dari API: ${responseData.message || 'Tidak ada pesan spesifik.'}`);
    }
    
    return responseData;
  } catch (err) {
    // [DEBUG] Menampilkan log error yang lebih lengkap
    console.error("\n❌ Terjadi kesalahan detail saat komunikasi API:");
    if (err.response) {
      console.error(`   -> Status Code: ${err.response.status}`);
      console.error("   -> Respons Error:", err.response.data);
      if (err.response.status === 401) {
        console.error("   ➡️  Autentikasi Gagal. Token ditolak oleh server.");
      }
    } else if (err.request) {
      console.error("   -> Error Permintaan: Tidak ada respons diterima dari server.");
      console.error("   -> Ini bisa berarti server down, URL salah, atau ada firewall/masalah jaringan.");
    } else {
      console.error("   -> Error Umum:", err.message);
    }
    return null;
  }
}

/**
 * Mencari item berdasarkan kata kunci (nama atau SKU).
 */
async function searchItems() {
  rl.question("\nMasukkan nama atau SKU barang untuk dicari: ", async (keyword) => {
    if (!keyword.trim()) {
        console.log("⚠️ Kata kunci tidak boleh kosong.");
        mainMenu();
        return;
    }
    console.log("\n⏳ Mencari barang...");
    const data = await callApi("/master-item/select", {});

    if (data && data.success && Array.isArray(data.data)) {
      const filteredItems = data.data.filter(item => {
        const keywordLower = keyword.trim().toLowerCase();
        const nameMatch = item.name && item.name.toLowerCase().includes(keywordLower);
        const skuMatch = item.sku && item.sku.toLowerCase().includes(keywordLower);
        return nameMatch || skuMatch;
      });

      if (filteredItems.length > 0) {
        console.log(`\n📦 Ditemukan ${filteredItems.length} hasil untuk "${keyword}":`);
        console.log("-------------------------------------------------");
        filteredItems.forEach((item) => {
          console.log(`  Nama       : ${item.name}`);
          console.log(`  SKU        : ${item.sku ?? 'N/A'}`);
          console.log(`  Code       : ${item.code}`);
          console.log(`  Harga Jual : ${item.price ?? 'N/A'}`);
          console.log(`  HPP        : ${item.price_net ?? 'N/A'}`);
          console.log(`  Stok (Qty) : ${item.qty ?? 'N/A'}`);
          console.log("-------------------------------------------------");
        });
      } else {
        console.log("\n⚠️ Tidak ada item yang cocok dengan kata kunci tersebut.");
      }
    } else {
      console.log("\n⚠️ Gagal mengambil data item atau tidak ada item sama sekali.");
    }
    mainMenu();
  });
}

/**
 * Mengedit detail item (nama, HPP, harga jual) berdasarkan 'code' item.
 */
async function editItem() {
  rl.question("\nMasukkan CODE item yang akan diedit: ", async (code) => {
    const itemCode = code.trim();
    if (!itemCode) {
      console.log("⚠️ Code tidak boleh kosong.");
      mainMenu();
      return;
    }

    console.log(`\n⏳ Mengambil data item dengan kode: ${itemCode}...`);
    const allData = await callApi("/master-item/select", {});

    if (!allData || !allData.success || !Array.isArray(allData.data)) {
      console.log("❌ Gagal mendapatkan daftar item.");
      mainMenu();
      return;
    }

    const itemToUpdate = allData.data.find(item => item.code && item.code.toString() === itemCode);

    if (!itemToUpdate) {
      console.log(`⚠️ Item dengan kode '${itemCode}' tidak ditemukan.`);
      mainMenu();
      return;
    }

    console.log("\n✅ Item ditemukan! Data saat ini:");
    console.log(`   Nama       : ${itemToUpdate.name}`);
    console.log(`   HPP        : ${itemToUpdate.price_net ?? 'N/A'}`);
    console.log(`   Harga Jual : ${itemToUpdate.price ?? 'N/A'}`);
    console.log("--- (Kosongkan input jika tidak ingin mengubah data) ---");

    rl.question(`   -> Masukkan Nama baru: `, (name) => {
      rl.question(`   -> Masukkan HPP baru: `, (hpp) => {
        rl.question(`   -> Masukkan Harga Jual baru: `, async (hargaJual) => {
          
          const payload = {
            ...itemToUpdate,
            name: name.trim() || itemToUpdate.name,
            price_net: hpp.trim() || itemToUpdate.price_net,
            price: hargaJual.trim() || itemToUpdate.price,
          };

          console.log("\n⏳ Mengirim pembaruan...");
          const data = await callApi("/master-item/update", payload);

          if (data && data.success) {
            console.log("\n✅ Sukses:", data.message || "Item berhasil diperbarui.");
          } else {
            console.log("\n❌ Gagal mengedit item.");
          }
          mainMenu();
        });
      });
    });
  });
}

/**
 * Menyesuaikan kuantitas (stok) item.
 */
async function adjustQty() {
  rl.question("\nMasukkan CODE item yang akan disesuaikan stoknya: ", async (code) => {
    const itemCode = code.trim();
    if (!itemCode) {
      console.log("⚠️ Code tidak boleh kosong.");
      mainMenu();
      return;
    }

    console.log(`\n⏳ Mengambil data item dengan kode: ${itemCode}...`);
    const allData = await callApi("/master-item/select", {});

    if (!allData || !allData.success || !Array.isArray(allData.data)) {
        console.log("❌ Gagal mendapatkan daftar item.");
        mainMenu();
        return;
    }

    const itemToUpdate = allData.data.find(item => item.code && item.code.toString() === itemCode);
    if (!itemToUpdate) {
        console.log(`⚠️ Item dengan kode '${itemCode}' tidak ditemukan.`);
        mainMenu();
        return;
    }

    const currentQty = parseFloat(itemToUpdate.qty) || 0;
    console.log(`\n✅ Item ditemukan! [${itemToUpdate.name}]`);
    console.log(`   Stok saat ini: ${currentQty}`);
    console.log("---");

    rl.question("   -> Masukkan jumlah penyesuaian (misal: 5 untuk menambah, -3 untuk mengurangi): ", async (adjustment) => {
      const adjustmentValue = parseFloat(adjustment.trim());
      if (isNaN(adjustmentValue)) {
        console.log("⚠️ Jumlah penyesuaian harus berupa angka.");
        mainMenu();
        return;
      }
      
      const newQty = currentQty + adjustmentValue;

      const payload = {
        ...itemToUpdate,
        qty: newQty,
      };

      console.log(`\n⏳ Mengubah stok dari ${currentQty} menjadi ${newQty}...`);
      const data = await callApi("/master-item/update", payload);

      if (data && data.success) {
        console.log("\n✅ Sukses:", data.message || "Kuantitas berhasil diperbarui.");
      } else {
        console.log("\n❌ Gagal memperbarui kuantitas.");
      }
      mainMenu();
    });
  });
}

/**
 * Laporan rinci penjualan untuk satu item spesifik dalam rentang tanggal.
 */
async function detailedItemSalesReport() {
  const red = "\x1b[31m";
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";

  rl.question("\nMasukkan nama barang yang ingin dilacak: ", async (itemName) => {
    rl.question("Masukkan Tanggal Mulai (YYYY-MM-DD): ", (startDateInput) => {
      rl.question("Masukkan Tanggal Akhir (YYYY-MM-DD): ", async (endDateInput) => {
        const nameToSearch = itemName.trim().toLowerCase();
        const dateStart = startDateInput.trim();
        const dateEnd = endDateInput.trim();

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!itemName.trim() || !dateRegex.test(dateStart) || !dateRegex.test(dateEnd)) {
          console.log("⚠️ Masukan nama barang atau format tanggal (YYYY-MM-DD) tidak valid.");
          mainMenu();
          return;
        }

        console.log(`\n⏳ Mengambil data stok terkini untuk '${itemName}'...`);
        const allItemsData = await callApi("/master-item/select", {});
        if (!allItemsData || !allItemsData.success || !Array.isArray(allItemsData.data)) {
          console.log("❌ Gagal mengambil data master item.");
          mainMenu();
          return;
        }

        const itemData = allItemsData.data.find(item => item.name && item.name.toLowerCase() === nameToSearch);

        if (!itemData) {
          console.log(`\n⚠️ Barang dengan nama '${itemName}' tidak ditemukan di master data.`);
          mainMenu();
          return;
        }
        
        const currentStock = parseFloat(itemData.qty) || 0;

        const dateStartStr = `${dateStart} 00:00:00`;
        const dateEndStr = `${dateEnd} 23:59:59`;

        console.log(`\n⏳ Mencari riwayat penjualan '${itemName}' dari ${dateStartStr} hingga ${dateEndStr}...`);
        
        const payload = { date_start: dateStartStr, date_end: dateEndStr, with_detail: 1 };
        const transactionData = await callApi("/report-transaction/sales_complete", payload);

        if (!transactionData || !transactionData.success) {
          console.log("❌ Gagal mendapatkan riwayat transaksi.");
          mainMenu();
          return;
        }

        const transactions = Array.isArray(transactionData.data) ? transactionData.data : [];
        
        if (transactions.length === 0) {
            console.log("\nℹ️ Tidak ada transaksi sama sekali pada periode yang dipilih.");
            mainMenu();
            return;
        }

        let totalQty = 0;
        let totalVoidQty = 0;
        const successfulTransactionDetails = [];
        const voidedTransactionDetails = [];

        for (const transaction of transactions) {
          if (Array.isArray(transaction.detail)) {
            for (const itemDetail of transaction.detail) {
              if (itemDetail && itemDetail.item_name && itemDetail.item_name.toLowerCase().includes(nameToSearch)) {
                const qty = parseFloat(itemDetail.qty);
                if (!isNaN(qty)) {
                  let plate = transaction.notes || 'N/A';
                  if ((!plate || plate === 'N/A') && transaction.customer_name) {
                      plate = transaction.customer_name.split('/')[0].trim();
                  }

                  const detail = {
                    receipt: transaction.receipt,
                    date: transaction.date,
                    plate: plate,
                    qty: qty,
                  };

                  if (transaction.void_status === 0) {
                    totalQty += qty;
                    successfulTransactionDetails.push(detail);
                  } else {
                    totalVoidQty += qty;
                    voidedTransactionDetails.push(detail);
                  }
                }
              }
            }
          }
        }
        
        const stockBefore = currentStock + totalQty - totalVoidQty;
        const voidedPlates = new Set(voidedTransactionDetails.map(trx => trx.plate));

        if (successfulTransactionDetails.length > 0 || voidedTransactionDetails.length > 0) {
          console.log("\n✅ Laporan Penjualan Ditemukan:");
          console.log("----------------------------------------------------------");
          console.log(`  Nama Barang         : ${itemName}`);
          console.log(`  Periode             : ${dateStart} s/d ${dateEnd}`);
          console.log(`  Stok Awal Periode   : ${stockBefore}`);
          console.log(`  Total Terjual       : ${totalQty}`);
          if (totalVoidQty > 0) {
            console.log(`  Total Dibatalkan    : ${red}${totalVoidQty}${reset}`);
          }
          console.log(`  Stok Akhir (Saat Ini) : ${currentStock}`);
          console.log("----------------------------------------------------------");
          
          if (successfulTransactionDetails.length > 0) {
            console.log(" Rincian Transaksi Berhasil:");
            console.log(` ${"Tanggal".padEnd(22)}| ${"Nomor Nota".padEnd(15)}| ${"Plat Mobil".padEnd(15)}| Qty`);
            console.log("----------------------------------------------------------");
            successfulTransactionDetails.forEach(trx => {
              const line = ` ${trx.date.padEnd(22)}| ${trx.receipt.padEnd(15)}| ${trx.plate.padEnd(15)}| ${trx.qty}`;
              if (voidedPlates.has(trx.plate)) {
                  console.log(`${yellow}${line}${reset}  <-- Plat ini pernah dibatalkan`);
              } else {
                  console.log(line);
              }
            });
            console.log("----------------------------------------------------------");
          }

          if (voidedTransactionDetails.length > 0) {
            console.log(`\n ${red}Rincian Transaksi Dibatalkan (Void):${reset}`);
            console.log(` ${"Tanggal".padEnd(22)}| ${"Nomor Nota".padEnd(15)}| ${"Plat Mobil".padEnd(15)}| Qty`);
            console.log("----------------------------------------------------------");
            voidedTransactionDetails.forEach(trx => {
              console.log(`${red} ${trx.date.padEnd(22)}| ${trx.receipt.padEnd(15)}| ${trx.plate.padEnd(15)}| ${trx.qty}${reset}`);
            });
            console.log("----------------------------------------------------------");
          }

        } else {
          console.log(`\n⚠️ Tidak ada data penjualan untuk '${itemName}' pada periode yang dipilih.`);
        }
        mainMenu();
      });
    });
  });
}

/**
 * Rekap penjualan semua item dalam rentang tanggal.
 */
async function monthlySalesSummaryForAllItems() {
  rl.question("Masukkan Tanggal Mulai (YYYY-MM-DD): ", (startDateInput) => {
    rl.question("Masukkan Tanggal Akhir (YYYY-MM-DD): ", async (endDateInput) => {
      const dateStart = startDateInput.trim();
      const dateEnd = endDateInput.trim();

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStart) || !dateRegex.test(dateEnd)) {
        console.log("⚠️ Format tanggal (YYYY-MM-DD) tidak valid.");
        mainMenu();
        return;
      }
      
      const dateStartStr = `${dateStart} 00:00:00`;
      const dateEndStr = `${dateEnd} 23:59:59`;

      console.log(`\n⏳ Menghitung rekap penjualan dari ${dateStartStr} hingga ${dateEndStr}...`);
      
      const payload = { date_start: dateStartStr, date_end: dateEndStr, with_detail: 1 };
      const transactionData = await callApi("/report-transaction/sales_complete", payload);

      if (!transactionData || !transactionData.success) {
        console.log("❌ Gagal mendapatkan riwayat transaksi.");
        mainMenu();
        return;
      }

      const transactions = Array.isArray(transactionData.data) ? transactionData.data : [];
      const salesSummary = {}; // { namaBarang: totalQty }

      for (const transaction of transactions) {
        if (transaction.void_status === 0 && Array.isArray(transaction.detail)) {
          for (const itemDetail of transaction.detail) {
            if (itemDetail && itemDetail.item_name) {
              const qty = parseFloat(itemDetail.qty);
              if (!isNaN(qty)) {
                salesSummary[itemDetail.item_name] = (salesSummary[itemDetail.item_name] || 0) + qty;
              }
            }
          }
        }
      }
      
      if (Object.keys(salesSummary).length > 0) {
        console.log(`\n✅ Rekap Penjualan untuk periode ${dateStart} s/d ${dateEnd}:`);
        const sortedItems = Object.keys(salesSummary).sort();
        
        console.log("----------------------------------------------------------");
        console.log(` ${"Nama Barang".padEnd(45)} | ${"Total Qty".padEnd(10)}`);
        console.log("----------------------------------------------------------");
        sortedItems.forEach(itemName => {
            console.log(` ${itemName.padEnd(45)} | ${salesSummary[itemName].toString().padEnd(10)}`);
        });
        console.log("----------------------------------------------------------");

      } else {
        console.log(`\n⚠️ Tidak ada data penjualan pada periode yang dipilih.`);
      }
      mainMenu();
    });
  });
}

/**
 * Cek detail transaksi berdasarkan nomor nota/receipt.
 */
async function checkReceiptDetails() {
  rl.question("\nMasukkan Nomor Nota/Receipt untuk dicek: ", async (receipt) => {
    const receiptNumber = receipt.trim();
    if (!receiptNumber) {
      console.log("⚠️ Nomor nota tidak boleh kosong.");
      mainMenu();
      return;
    }

    console.log(`\n⏳ Mencari detail untuk nota: ${receiptNumber}...`);
    const data = await callApi("/transaction/detail", { receipt: receiptNumber });

    if (data && data.success && data.data) {
      const trx = data.data;
      console.log("\n✅ Detail Transaksi Ditemukan:");
      console.log("-------------------------------------------------");
      console.log(`  Nomor Nota : ${trx.receipt}`);
      console.log(`  Tanggal    : ${trx.date}`);
      console.log(`  Kasir      : ${trx.cashier_name}`);
      console.log(`  Pelanggan  : ${trx.customer_name || 'N/A'}`);
       // [IMPROVEMENT] Logika ekstraksi plat nomor
      let plate = trx.notes || 'N/A';
      if ((!plate || plate === 'N/A') && trx.customer_name) {
          plate = trx.customer_name.split('/')[0].trim();
      }
      console.log(`  Plat Mobil : ${plate}`);
      console.log(`  Total      : ${trx.total}`);
      console.log("--- Rincian Barang ---");

      if (Array.isArray(trx.detail) && trx.detail.length > 0) {
        trx.detail.forEach(item => {
          console.log(`  - ${item.item_name}`);
          console.log(`    Qty: ${item.qty} | Harga: ${item.price} | Subtotal: ${item.subtotal}`);
        });
      } else {
        console.log("  (Tidak ada rincian barang)");
      }
      console.log("-------------------------------------------------");
    } else {
      console.log(`\n⚠️ Gagal mendapatkan detail atau nota '${receiptNumber}' tidak ditemukan.`);
    }
    mainMenu();
  });
}

/**
 * [FITUR BARU] Menganalisis selisih stok untuk satu barang.
 */
async function analyzeStockDiscrepancy() {
    const red = "\x1b[31m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const reset = "\x1b[0m";

    rl.question("\nMasukkan nama barang yang ingin dianalisis: ", async (itemName) => {
        rl.question("Masukkan stok aktual (dari Google Sheet/fisik): ", (actualStockInput) => {
            rl.question("Masukkan Tanggal Mulai Analisis (YYYY-MM-DD): ", (startDateInput) => {
                rl.question("Masukkan Tanggal Akhir Analisis (YYYY-MM-DD): ", async (endDateInput) => {
                    const nameToSearch = itemName.trim().toLowerCase();
                    const actualStock = parseFloat(actualStockInput.trim());
                    const dateStart = startDateInput.trim();
                    const dateEnd = endDateInput.trim();

                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!itemName.trim() || isNaN(actualStock) || !dateRegex.test(dateStart) || !dateRegex.test(dateEnd)) {
                        console.log("⚠️ Masukan tidak valid. Pastikan nama barang, stok, dan format tanggal (YYYY-MM-DD) benar.");
                        mainMenu();
                        return;
                    }
                    
                    console.log(`\n⏳ Mengambil data stok terkini untuk '${itemName}'...`);
                    const allItemsData = await callApi("/master-item/select", {});
                    if (!allItemsData || !allItemsData.success || !Array.isArray(allItemsData.data)) {
                        console.log("❌ Gagal mengambil data master item.");
                        mainMenu();
                        return;
                    }

                    const itemData = allItemsData.data.find(item => item.name && item.name.toLowerCase() === nameToSearch);
                    if (!itemData) {
                        console.log(`\n⚠️ Barang dengan nama '${itemName}' tidak ditemukan di master data.`);
                        mainMenu();
                        return;
                    }
                    const currentStockWoogigs = parseFloat(itemData.qty) || 0;

                    console.log(`\n⏳ Menghitung transaksi dari ${dateStart} hingga ${dateEnd}...`);
                    const payload = { date_start: `${dateStart} 00:00:00`, date_end: `${dateEnd} 23:59:59`, with_detail: 1 };
                    const transactionData = await callApi("/report-transaction/sales_complete", payload);

                    if (!transactionData || !transactionData.success) {
                        console.log("❌ Gagal mendapatkan riwayat transaksi untuk analisis.");
                        mainMenu();
                        return;
                    }

                    let totalQty = 0;
                    let totalVoidQty = 0;
                    const transactions = Array.isArray(transactionData.data) ? transactionData.data : [];

                    for (const transaction of transactions) {
                        if (Array.isArray(transaction.detail)) {
                            for (const itemDetail of transaction.detail) {
                                if (itemDetail && itemDetail.item_name && itemDetail.item_name.toLowerCase().includes(nameToSearch)) {
                                    const qty = parseFloat(itemDetail.qty);
                                    if (!isNaN(qty)) {
                                        if (transaction.void_status === 0) {
                                            totalQty += qty;
                                        } else {
                                            totalVoidQty += qty;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    const stockBefore = currentStockWoogigs + totalQty - totalVoidQty;
                    const discrepancy = actualStock - currentStockWoogigs;
                    
                    console.log("\n✅ Hasil Analisis Selisih Stok:");
                    console.log("==========================================================");
                    console.log(`  Nama Barang             : ${itemName}`);
                    console.log(`  Periode Analisis        : ${dateStart} s/d ${dateEnd}`);
                    console.log("----------------------------------------------------------");
                    console.log(`  Stok Awal (Estimasi)    : ${stockBefore}`);
                    console.log(`  (+) Total Qty Dibatalkan: ${totalVoidQty}`);
                    console.log(`  (-) Total Qty Terjual   : ${totalQty}`);
                    console.log("----------------------------------------------------------");
                    console.log(`  Stok Akhir (di Woogigs) : ${currentStockWoogigs}`);
                    console.log(`  Stok Aktual (Input)     : ${actualStock}`);
                    console.log("==========================================================");

                    if (discrepancy === 0) {
                        console.log(`  ${green}KESIMPULAN: Tidak ada selisih. Stok Woogigs sesuai dengan stok aktual.${reset}`);
                    } else {
                        const sign = discrepancy > 0 ? "+" : "";
                        console.log(`  ${red}KESIMPULAN: Ditemukan selisih ${sign}${discrepancy} item.${reset}`);
                        if (discrepancy > 0) {
                            console.log(`  ${yellow}Saran: Stok aktual LEBIH BANYAK dari catatan Woogigs. Kemungkinan ada penerimaan barang yang belum dicatat atau kesalahan transaksi penjualan (jumlah barang terjual lebih besar dari seharusnya).${reset}`);
                        } else {
                             console.log(`  ${yellow}Saran: Stok aktual LEBIH SEDIKIT dari catatan Woogigs. Kemungkinan ada barang hilang/rusak, atau transaksi penjualan yang belum tercatat di sistem.${reset}`);
                        }
                    }
                    console.log("==========================================================");

                    mainMenu();
                });
            });
        });
    });
}


/**
 * Mengekspor seluruh data stok ke file CSV.
 */
async function exportStockToCsv() {
    console.log("\n⏳ Mengambil seluruh data master barang untuk ekspor...");
    const data = await callApi("/master-item/select", {});

    if (!data || !data.success || !Array.isArray(data.data)) {
        console.log("❌ Gagal mengambil data item untuk diekspor.");
        mainMenu();
        return;
    }

    const header = "SKU,Nama Barang,Qty Woogigs\n";
    // Fungsi untuk memastikan data aman untuk CSV (menghandle koma)
    const sanitize = (value) => {
        if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
        }
        return value ?? '';
    };
    
    const rows = data.data.map(item => 
        `${sanitize(item.sku)},${sanitize(item.name)},${item.qty || 0}`
    ).join("\n");

    const csvContent = header + rows;
    const date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    const fileName = `laporan_stok_woogigs_${date}.csv`;

    try {
        fs.writeFileSync(fileName, csvContent);
        console.log(`\n✅ Sukses! Data stok telah diekspor ke file: ${fileName}`);
    } catch (err) {
        console.error("\n❌ Gagal menyimpan file CSV:", err);
    }
    
    mainMenu();
}


/**
 * Fungsi menu utama untuk navigasi.
 */
function mainMenu() {
  const green = "\x1b[32m";
  const cyan = "\x1b[36m";
  const yellow = "\x1b[33m";
  const reset = "\x1b[0m";

  console.log(`
${green}==================================================${reset}
${green}║${reset}       ${cyan}SERENDIPITY - WOOGIGS CLI TOOL${reset}       ${green}║${reset}
${green}║${reset}           ${cyan}Developed by YaelahYuds${reset}            ${green}║${reset}
${green}==================================================${reset}
 ${yellow}PILIH OPSI:${reset}
   ${cyan}1.${reset} Cari Barang
   ${cyan}2.${reset} Edit Barang (Nama, HPP, Harga)
   ${cyan}3.${reset} Sesuaikan Stok (Qty)
   ${cyan}4.${reset} Laporan Rinci Penjualan per Barang
   ${cyan}5.${reset} Laporan Rekap Penjualan Bulanan
   ${cyan}6.${reset} Cek Detail Nota
   ${cyan}7.${reset} Analisis Selisih Stok
   ${cyan}8.${reset} Ekspor Stok ke CSV
   ${cyan}9.${reset} Keluar
`);
  
  rl.question(`${cyan}>>> ${reset}Masukkan pilihan (1-9): `, (option) => {
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
        detailedItemSalesReport();
        break;
      case "5":
        monthlySalesSummaryForAllItems();
        break;
      case "6":
        checkReceiptDetails(); 
        break;
      case "7":
        analyzeStockDiscrepancy(); // [BARU] Panggil fungsi analisis
        break;
      case "8":
        exportStockToCsv(); 
        break;
      case "9":
        console.log(`\n${green}Terima kasih telah menggunakan tool ini!${reset}`);
        rl.close();
        break;
      default:
        console.log(`\n${yellow}⚠️ Opsi tidak valid. Silakan pilih antara 1-9.${reset}`);
        mainMenu();
        break;
    }
  });
}

// Mulai skrip
console.log("Selamat datang di Woogigs CLI Management Tool!");
mainMenu();

