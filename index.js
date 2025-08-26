// index.js
const axios = require("axios");

// Ganti token sesuai milik Anda
const API_TOKEN = "67cebdfd4ed4e";
const BASE_URL = "https://backoffice.woogigs.com/master-item";

// Contoh fungsi untuk update data item
async function updateItem({ code, name, qty, hpp, harga_jual }) {
  try {
    const response = await axios.put(
      `${BASE_URL}/update/${code}`, // asumsi endpoint update pakai code
      {
        name,
        qty,
        hpp,
        harga_jual,
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Update berhasil:", response.data);
  } catch (err) {
    console.error("❌ Gagal update:", err.response?.data || err.message);
  }
}

// Contoh pemanggilan fungsi update
updateItem({
  code: 1603468, // code item dari payload select
  name: "GENERAL MOTOR WASHER (B 1712 POE)", // nama baru
  qty: 50, // update qty
  hpp: 150000, // update HPP
  harga_jual: 200000, // update Harga Jual
});
