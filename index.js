// index.js
import fetch from "node-fetch";
import inquirer from "inquirer";

const BASE_URL = "https://backoffice.woogigs.com/master-item";
const TOKEN = "67cebdfd4ed4e"; // masukkan token di sini

// Fungsi request umum
async function apiRequest(endpoint, method = "POST", body = {}) {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": TOKEN, // token harus di header
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("❌ Respon bukan JSON:", text);
      return null;
    }
  } catch (err) {
    console.error("❌ Error request:", err.message);
    return null;
  }
}

// Cari item
async function searchItem(query) {
  const data = await apiRequest("select", "POST", { search: query });
  if (data && data.success && data.data && data.data.length > 0) {
    return data.data;
  }
  console.log("❌ Tidak ada item ditemukan");
  return [];
}

// Update item
async function updateItem(itemId, hpp, hargaJual) {
  const body = {
    id: itemId,
    hpp: hpp,
    harga_jual: hargaJual,
  };

  const data = await apiRequest("update", "POST", body);
  if (data && data.success) {
    console.log("✅ Update berhasil:", data.message || "");
  } else {
    console.log("❌ Update gagal:", data?.message || "Unknown error");
  }
}

async function main() {
  const { query } = await inquirer.prompt([
    {
      type: "input",
      name: "query",
      message: "Masukkan nama part / SKU untuk dicari:",
    },
  ]);

  const items = await searchItem(query);

  if (items.length === 0) return;

  console.log("\n📦 Hasil pencarian:");
  items.forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.nama_item} | HPP: ${item.hpp} | Harga Jual: ${item.harga_jual}`);
  });

  const { selectedIdx } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedIdx",
      message: "Pilih item untuk update:",
      choices: items.map((item, idx) => ({
        name: `${item.nama_item} (HPP: ${item.hpp}, Jual: ${item.harga_jual})`,
        value: idx,
      })),
    },
  ]);

  const item = items[selectedIdx];

  const { hpp, hargaJual } = await inquirer.prompt([
    {
      type: "input",
      name: "hpp",
      message: `Masukkan HPP baru (sekarang ${item.hpp}):`,
      validate: (val) => (!isNaN(val) ? true : "Harus angka"),
    },
    {
      type: "input",
      name: "hargaJual",
      message: `Masukkan Harga Jual baru (sekarang ${item.harga_jual}):`,
      validate: (val) => (!isNaN(val) ? true : "Harus angka"),
    },
  ]);

  await updateItem(item.id, hpp, hargaJual);
}

main();
