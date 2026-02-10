const Reminder = require('../models/reminderModel');

// Controller untuk mendapatkan semua reminder user
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.id });
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// Controller untuk membuat reminder baru
const createReminder = async (req, res) => {
  const { title, amount, dueDate } = req.body;

  // Validasi input
  if (!title || !amount || !dueDate) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  try {
    const reminder = await Reminder.create({
      user: req.user.id,
      title,
      amount,
      dueDate,
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat reminder' });
  }
};

// Controller untuk mengupdate status reminder
const updateReminderStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const reminder = await Reminder.findById(id);

    if (!reminder || reminder.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Reminder tidak ditemukan' });
    }

    reminder.isPaid = !reminder.isPaid;
    await reminder.save();

    res.status(200).json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate status reminder' });
  }
};

// Controller untuk menghapus reminder
const deleteReminder = async (req, res) => {
  const { id } = req.params;

  try {
    const reminder = await Reminder.findById(id);

    if (!reminder || reminder.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Reminder tidak ditemukan' });
    }

    await reminder.deleteOne();
    res.status(200).json({ message: 'Reminder berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus reminder' });
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder,
};