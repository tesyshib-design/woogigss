const axios = require("axios");
const readline = require("readline-sync");

// Ganti token sesuai milik Anda
const API_TOKEN = "67cebdfd4ed4e";
const BASE_URL = "https://backoffice.woogigs.com/master-item";

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
};

// 🔹 Fungsi ambil data item
async function getItems() {
  try {
    const res = await axios.get(`${BASE_URL}/list`, { headers });
    return res.data.data; // asumsi payload -> { success:true, data:[...] }
  } catch (err) {
    console.error("❌ Gagal ambil data:", err.response?.data || err.message);
    return [];
  }
}

// 🔹 Fungsi update item
async function updateItem({ code, name, qty, hpp, harga_jual }) {
  try {
    const res = await axios.put(
      `${BASE_URL}/update/${code}`,
      { name, qty, hpp, harga_jual },
      { headers }
    );
    console.log("✅ Update berhasil:", res.data);
  } catch (err) {
    console.error("❌ Gagal update:", err.response?.data || err.message);
  }
}

// 🔹 Main
(async () => {
  const items = await getItems();
  if (!items.length) return;

  console.log(`\n📦 Data Item Woogigs (${items.length} ditemukan):`);
  items.slice(0, 10).forEach((it, i) => {
    console.log(
      `${i + 1}. [${it.code}] ${it.name} | Qty: ${it.qty} | HPP: ${it.hpp} | Harga Jual: ${it.harga_jual}`
    );
  });
  console.log("\n(Catatan: hanya tampil 10 item pertama)");

  // Cari item
  const keyword = readline.question("\n🔍 Cari nama/sku item: ");
  const filtered = items.filter(
    (it) =>
      it.name.toLowerCase().includes(keyword.toLowerCase()) ||
      it.sku.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!filtered.length) {
    console.log("⚠️ Item tidak ditemukan.");
    return;
  }

  filtered.forEach((it, i) =>
    console.log(`${i + 1}. [${it.code}] ${it.name} (SKU: ${it.sku})`)
  );

  const idx = readline.questionInt("\nPilih nomor item: ") - 1;
  const selected = filtered[idx];
  if (!selected) {
    console.log("⚠️ Pilihan tidak valid.");
    return;
  }

  console.log(`\n✏️ Edit item: [${selected.code}] ${selected.name}`);

  const newName =
    readline.question(`Nama baru (${selected.name}): `) || selected.name;
  const newQty =
    readline.questionInt(`Qty baru (${selected.qty}): `) || selected.qty;
  const newHpp =
    readline.questionInt(`HPP baru (${selected.hpp || 0}): `) ||
    selected.hpp ||
    0;
  const newHargaJual =
    readline.questionInt(`Harga Jual baru (${selected.harga_jual || 0}): `) ||
    selected.harga_jual ||
    0;

  await updateItem({
    code: selected.code,
    name: newName,
    qty: newQty,
    hpp: newHpp,
    harga_jual: newHargaJual,
  });
})();
