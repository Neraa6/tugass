const mongoose = require('mongoose');

// Definisi schema untuk Reminder
const reminderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Buat model berdasarkan schema
const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;