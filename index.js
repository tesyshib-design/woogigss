// woogigs.js
import fetch from "node-fetch";
import inquirer from "inquirer";
import Table from "cli-table3";

const API_SELECT = "https://backoffice.woogigs.com/master-item/select";
const API_UPDATE = "https://backoffice.woogigs.com/master-item/update";
const TOKEN = "67cebdfd4ed4e";

// 🔹 Fetch data item
async function fetchItems(search = "") {
  const res = await fetch(API_SELECT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "token": TOKEN,
    },
    body: JSON.stringify({
      search,
      limit: 20,
      page: 1,
    }),
  });

  const data = await res.json();
  return data.data || [];
}

// 🔹 Update item
async function updateItem(item) {
  const res = await fetch(API_UPDATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "token": TOKEN,
    },
    body: JSON.stringify(item),
  });

  const result = await res.json();
  console.log("Update Result:", result);
}

// 🔹 Tampilkan tabel
function showTable(items) {
  const table = new Table({
    head: ["Code", "SKU", "Name", "Qty", "Harga HPP", "Harga Jual"],
    colWidths: [10, 10, 40, 10, 15, 15],
  });

  items.forEach(it => {
    table.push([it.code, it.sku, it.name, it.qty, it.hpp, it.price]);
  });

  console.log(table.toString());
}

// 🔹 Main
async function main() {
  let searchTerm = await inquirer.prompt({
    type: "input",
    name: "search",
    message: "Masukkan nama part / SKU untuk dicari:",
  });

  const items = await fetchItems(searchTerm.search);
  if (items.length === 0) {
    console.log("❌ Tidak ada item ditemukan");
    return;
  }

  showTable(items);

  const { code } = await inquirer.prompt({
    type: "list",
    name: "code",
    message: "Pilih item yang ingin diupdate:",
    choices: items.map(it => ({ name: `${it.name} (${it.sku})`, value: it.code })),
  });

  const selected = items.find(it => it.code === code);

  const updated = await inquirer.prompt([
    { type: "input", name: "name", message: "Nama Part:", default: selected.name },
    { type: "number", name: "qty", message: "Qty:", default: selected.qty },
    { type: "number", name: "hpp", message: "Harga HPP:", default: selected.hpp },
    { type: "number", name: "price", message: "Harga Jual:", default: selected.price },
  ]);

  await updateItem({ ...selected, ...updated });
}

main();
