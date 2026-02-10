// Import mongoose untuk membuat skema
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definisi skema untuk User
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, // Tipe data string
      required: [true, 'Nama diperlukan'], // Validasi: wajib diisi
    },
    email: {
      type: String, // Tipe data string
      required: [true, 'Email diperlukan'], // Validasi: wajib diisi
      unique: true, // Email harus unik
    },
    password: {
      type: String, // Tipe data string
      required: [true, 'Password diperlukan'], // Validasi: wajib diisi
    },
  },
  {
    timestamps: true, // Tambahkan kolom createdAt dan updatedAt
  }
);

// Middleware untuk hashing password sebelum menyimpan data user
userSchema.pre('save', async function () {
  // Hanya hash password jika field password diubah
  if (!this.isModified('password')) return;

  // Hash password menggunakan bcrypt
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Metode untuk memeriksa kecocokan password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Buat model User berdasarkan skema
const User = mongoose.model('User', userSchema);

module.exports = User;