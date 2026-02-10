const mongoose = require('mongoose');
const Finance = require('../models/financeModel');

// ============================
// GET semua finance user
// ============================
const getFinances = async (req, res) => {
  try {
    const finances = await Finance.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(finances);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ============================
// CREATE finance baru
// ============================
const createFinance = async (req, res) => {
  const { title, amount, type, category } = req.body;

  if (!title || !amount || !type || !category) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Tipe harus income atau expense' });
  }

  if (!['salary', 'education', 'health', 'food', 'transportation', 'entertainment', 'utilities', 'others'].includes(category)) {
    return res.status(400).json({ message: 'Kategori tidak valid' });
  }

  try {
    const finance = await Finance.create({
      user: req.user.id,
      title,
      amount,
      type,
      category,
    });

    res.status(201).json(finance);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat data finance' });
  }
};

// ============================
// UPDATE finance
// ============================
const updateFinance = async (req, res) => {
  const { id } = req.params;

  try {
    const finance = await Finance.findById(id);

    if (!finance || finance.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const updatedFinance = await Finance.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json(updatedFinance);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate data finance' });
  }
};

// ============================
// DELETE finance
// ============================
const deleteFinance = async (req, res) => {
  const { id } = req.params;

  try {
    const finance = await Finance.findById(id);

    if (!finance || finance.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    await finance.deleteOne();
    res.status(200).json({ message: 'Data berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data finance' });
  }
};

// ============================
// FILTER finance (ADVANCED)
// ============================
const filterFinance = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const {
      type, month, year, keyword, category,
      minAmount, maxAmount, startDate, endDate
    } = req.query;

    let query = { user: userId };

    if (type) query.type = type;

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    if (category) query.category = category;

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
      ];
    }

    let dateFilter = {};

    if (year) {
      dateFilter.$gte = new Date(`${year}-01-01T00:00:00.000Z`);
      dateFilter.$lt = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
    }

    if (month) {
      const yearValue = year || new Date().getFullYear();
      const monthStart = new Date(`${yearValue}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
      const nextMonth = Number(month) + 1;

      const monthEnd = nextMonth > 12
        ? new Date(`${Number(yearValue) + 1}-01-01T00:00:00.000Z`)
        : new Date(`${yearValue}-${String(nextMonth).padStart(2, '0')}-01T00:00:00.000Z`);

      dateFilter.$gte = monthStart;
      dateFilter.$lt = monthEnd;
    }

    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    }

    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    const finances = await Finance.find(query).sort({ createdAt: -1 });

    res.status(200).json(finances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// SUMMARY TOTAL
// ============================
const getFinanceSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const finances = await Finance.find({ user: userId });

    const totalIncome = finances.filter(i => i.type === 'income').reduce((a, b) => a + b.amount, 0);
    const totalExpense = finances.filter(i => i.type === 'expense').reduce((a, b) => a + b.amount, 0);

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// CATEGORY STATS
// ============================
const getCategoryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Finance.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $ifNull: ['$category', 'uncategorized'] },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// MONTHLY STATS
// ============================
const getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ message: 'Tahun harus disertakan.' });
    }

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);

    const finances = await Finance.find({
      user: userId,
      createdAt: { $gte: startOfYear, $lt: endOfYear },
    });

    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    }));

    finances.forEach((item) => {
      const monthIndex = item.createdAt.getUTCMonth();

      if (item.type === 'income') monthlyStats[monthIndex].totalIncome += item.amount;
      if (item.type === 'expense') monthlyStats[monthIndex].totalExpense += item.amount;

      monthlyStats[monthIndex].balance =
        monthlyStats[monthIndex].totalIncome - monthlyStats[monthIndex].totalExpense;
    });

    res.status(200).json(monthlyStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// REPORT BY PERIOD (BARU)
// ============================
const getFinanceReportByPeriod = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Tanggal mulai dan akhir harus diisi' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Format tanggal tidak valid' });
    }

    if (start > end) {
      return res.status(400).json({ message: 'Tanggal mulai harus sebelum tanggal akhir' });
    }

    const finances = await Finance.find({
      user: userId,
      createdAt: { $gte: start, $lte: end },
    });

    const totalIncome = finances.filter(i => i.type === 'income').reduce((a, b) => a + b.amount, 0);
    const totalExpense = finances.filter(i => i.type === 'expense').reduce((a, b) => a + b.amount, 0);

    res.status(200).json({
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ============================
// EXPORT
// ============================
module.exports = {
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
  filterFinance,
  getFinanceSummary,
  getCategoryStats,
  getMonthlyStats,
  getFinanceReportByPeriod, // ✅ BARU
};
