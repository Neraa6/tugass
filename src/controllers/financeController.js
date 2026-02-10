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
  const { title, amount, type } = req.body;

  if (!title || !amount || !type) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  try {
    const finance = await Finance.create({
      user: req.user.id,
      title,
      amount,
      type,
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
// FILTER finance (type, month, year)
// ============================
const filterFinance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, month, year } = req.query;

    let query = { user: userId };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by year
    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
      query.createdAt = { $gte: startOfYear, $lt: endOfYear };
    }

    // Filter by month
    if (month) {
      const yearValue = year || new Date().getFullYear();

      const monthStart = new Date(`${yearValue}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
      const nextMonth = Number(month) + 1;

      const monthEnd = nextMonth > 12
        ? new Date(`${Number(yearValue) + 1}-01-01T00:00:00.000Z`)
        : new Date(`${yearValue}-${String(nextMonth).padStart(2, '0')}-01T00:00:00.000Z`);

      query.createdAt = { $gte: monthStart, $lt: monthEnd };
    }

    const finances = await Finance.find(query).sort({ createdAt: -1 });

    res.status(200).json(finances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// SUMMARY (Income, Expense, Balance)
// ============================
const getFinanceSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const finances = await Finance.find({ user: userId });

    const totalIncome = finances
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = finances
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
};
