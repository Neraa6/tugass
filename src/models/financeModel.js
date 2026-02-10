// Import mongoose untuk membuat skema
const mongoose = require('mongoose');

// Definisi skema untuk Finance
const financeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Relasi ke model User
      required: true, // Validasi: wajib diisi
      ref: 'User', // Referensi ke koleksi User
    },
    title: {
      type: String, // Tipe data string
      required: [true, 'Judul diperlukan'], // Validasi: wajib diisi
    },
    amount: {
      type: Number, // Tipe data angka
      required: [true, 'Jumlah diperlukan'], // Validasi: wajib diisi
    },
    type: {
      type: String, // Tipe data string
      required: [true, 'Tipe diperlukan'], // Validasi: wajib diisi
      enum: ['income', 'expense'], // Hanya boleh 'income' atau 'expense'
    },
  },
  {
    timestamps: true, // Tambahkan kolom createdAt dan updatedAt
  }
);

// Buat model Finance berdasarkan skema
const Finance = mongoose.model('Finance', financeSchema);

module.exports = Finance;