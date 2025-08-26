// index.js
import fetch from "node-fetch";
import inquirer from "inquirer";
import Table from "cli-table3";

// =======================
// Konfigurasi
// =======================
const API_SELECT = "https://backoffice.woogigs.com/master-item/select";
const API_UPDATE = "https://backoffice.woogigs.com/master-item/update";

// Token yang kamu kasih
const TOKEN = "67cebdfd4ed4e";

// =======================
// Fungsi tarik data
// =======================
async function fetchItems(keyword) {
  try {
    const payload = {
      search: keyword,
      page: 1,
      limit: 10,
    };

    const res = await fetch(API_SELECT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": TOKEN, // sesuai API woogigs
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    // kalau bukan JSON akan error, kita tangani
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("❌ Respon bukan JSON, kemungkinan token salah / endpoint error");
      console.error(text);
      return [];
    }

    return data?.data || [];
  } catch (err) {
    console.error("❌ Error fetchItems:", err.message);
    return [];
  }
}

// =======================
// Fungsi update item
// =======================
async function updateItem(item) {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "nama",
      message: `Nama baru untuk ${item.nama_item} (kosongkan jika tidak diubah):`,
    },
    {
      type: "input",
      name: "qty",
      message: `Qty baru (${item.qty}):`,
    },
    {
      type: "input",
      name: "hpp",
      message: `Harga HPP baru (${item.hpp || 0}):`,
    },
    {
      type: "input",
      name: "harga_jual",
      message: `Harga Jual baru (${item.harga_jual || 0}):`,
    },
  ]);

  const payload = {
    id: item.id,
    nama_item: answers.nama || item.nama_item,
    qty: answers.qty || item.qty,
    hpp: answers.hpp || item.hpp,
    harga_jual: answers.harga_jual || item.harga_jual,
  };

  try {
    const res = await fetch(API_UPDATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.error("❌ Respon update bukan JSON:", text);
      return;
    }

    if (result?.success) {
      console.log("✅ Item berhasil diupdate!");
    } else {
      console.error("❌ Gagal update item:", result?.message || result);
    }
  } catch (err) {
    console.error("❌ Error updateItem:", err.message);
  }
}

// =======================
// Main CLI
// =======================
async function main() {
  const { keyword } = await inquirer.prompt([
    { type: "input", name: "keyword", message: "Masukkan nama part / SKU untuk dicari:" },
  ]);

  const items = await fetchItems(keyword);

  if (items.length === 0) {
    console.log("❌ Tidak ada item ditemukan");
    return;
  }

  // tampilkan tabel
  const table = new Table({
    head: ["ID", "Nama", "Qty", "HPP", "Harga Jual"],
    colWidths: [10, 30, 10, 15, 15],
  });

  items.forEach((it) => {
    table.push([it.id, it.nama_item, it.qty, it.hpp || "-", it.harga_jual || "-"]);
  });

  console.log(table.toString());

  // pilih item untuk update
  const { pilih } = await inquirer.prompt([
    {
      type: "list",
      name: "pilih",
      message: "Pilih item untuk update:",
      choices: items.map((it) => ({ name: `${it.nama_item} (ID: ${it.id})`, value: it })),
    },
  ]);

  await updateItem(pilih);
}

main();
