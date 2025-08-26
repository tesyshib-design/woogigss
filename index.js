import fetch from "node-fetch";
import inquirer from "inquirer";

const API_BASE = "https://backoffice.woogigs.com";
const TOKEN = "GANTI_DENGAN_TOKEN"; // isi token kamu

// 🔍 Cari item
async function cariItem(keyword) {
  const res = await fetch(`${API_BASE}/master-item/select`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": TOKEN,
    },
    body: JSON.stringify({ keyword }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("❌ Respon bukan JSON:\n", text);
    return null;
  }

  if (data.success && data.data?.length > 0) {
    return data.data;
  } else {
    console.log("❌ Tidak ada item ditemukan");
    return null;
  }
}

// ✏️ Update harga
async function updateHarga(id, hargaBaru) {
  const res = await fetch(`${API_BASE}/master-item/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": TOKEN,
    },
    body: JSON.stringify({
      id,
      harga: hargaBaru,
    }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("❌ Respon update bukan JSON:\n", text);
    return null;
  }

  if (data.success) {
    console.log(`✅ Harga item ID ${id} berhasil diperbarui jadi Rp${hargaBaru}`);
  } else {
    console.log("❌ Gagal update harga:", data.message);
  }
}

async function main() {
  const { keyword } = await inquirer.prompt([
    { name: "keyword", message: "Masukkan nama part / SKU untuk dicari:" },
  ]);

  const items = await cariItem(keyword);
  if (!items) return;

  console.log("\n📦 Item ditemukan:");
  items.forEach((item, i) => {
    console.log(`${i + 1}. ${item.nama} | ID: ${item.id} | Harga: Rp${item.harga}`);
  });

  const { pilih } = await inquirer.prompt([
    {
      type: "list",
      name: "pilih",
      message: "Pilih item untuk update harga:",
      choices: items.map((it) => ({
        name: `${it.nama} (Rp${it.harga})`,
        value: it,
      })),
    },
  ]);

  const { hargaBaru } = await inquirer.prompt([
    { name: "hargaBaru", message: "Masukkan harga baru:", validate: (val) => !isNaN(val) },
  ]);

  await updateHarga(pilih.id, parseInt(hargaBaru));
}

main();
