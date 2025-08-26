import axios from "axios";
import inquirer from "inquirer";
import Table from "cli-table3";

// === SETTING API ===
const API_BASE = "https://api.woogigs.com"; // ganti ke endpoint asli
const TOKEN = "ISI_TOKEN_DISINI"; // ganti token auth

// === Fungsi ambil data ===
async function fetchItems() {
  try {
    const res = await axios.get(`${API_BASE}/items`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    return res.data.items || []; // sesuaikan struktur API
  } catch (err) {
    console.error("❌ Gagal ambil data:", err.message);
    return [];
  }
}

// === Fungsi tampilkan tabel ===
function printTable(items, limit = 10) {
  const table = new Table({
    head: ["Code", "SKU", "Nama", "Qty", "H.Jual"],
    colWidths: [10, 10, 40, 8, 12],
  });

  items.slice(0, limit).forEach((item) => {
    table.push([
      item.id || "-",
      item.sku || "-",
      item.name || "-",
      item.qty || 0,
      item.harga_jual || 0,
    ]);
  });

  console.log(table.toString());
}

// === Fungsi update item ===
async function updateItem(itemId, payload) {
  try {
    await axios.put(`${API_BASE}/items/${itemId}`, payload, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    console.log("✅ Data berhasil diupdate!");
  } catch (err) {
    console.error("❌ Gagal update:", err.message);
  }
}

// === Main Program ===
async function main() {
  const items = await fetchItems();
  if (items.length === 0) return;

  console.log("\n📦 Data Sparepart (10 pertama):");
  printTable(items);

  // Search
  const { keyword } = await inquirer.prompt([
    { type: "input", name: "keyword", message: "Cari nama / SKU:" },
  ]);

  const results = items.filter(
    (x) =>
      x.name.toLowerCase().includes(keyword.toLowerCase()) ||
      (x.sku && x.sku.toLowerCase().includes(keyword.toLowerCase()))
  );

  if (results.length === 0) {
    console.log("❌ Tidak ada hasil.");
    return;
  }

  // Pilih item
  const { chosen } = await inquirer.prompt([
    {
      type: "list",
      name: "chosen",
      message: "Pilih item untuk edit:",
      choices: results.map((x, i) => ({
        name: `${x.name} (SKU: ${x.sku}, Qty: ${x.qty})`,
        value: x,
      })),
    },
  ]);

  // Edit field
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Nama baru (enter skip):",
      default: chosen.name,
    },
    {
      type: "input",
      name: "qty",
      message: "Qty baru (enter skip):",
      default: chosen.qty,
    },
    {
      type: "input",
      name: "harga_hpp",
      message: "Harga HPP baru (enter skip):",
      default: chosen.harga_hpp,
    },
    {
      type: "input",
      name: "harga_jual",
      message: "Harga Jual baru (enter skip):",
      default: chosen.harga_jual,
    },
  ]);

  const payload = {
    name: answers.name,
    qty: Number(answers.qty),
    harga_hpp: Number(answers.harga_hpp),
    harga_jual: Number(answers.harga_jual),
  };

  await updateItem(chosen.id, payload);
}

main();
