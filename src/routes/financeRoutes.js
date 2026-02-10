const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMonthlyStats } = require('../controllers/financeController');
const { getFinanceReportByPeriod } = require('../controllers/financeController')

const {
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
  getFinanceSummary,
  filterFinance,
  getCategoryStats,
} = require('../controllers/financeController');

// ============================
// EXTRA FEATURES (STATIC FIRST)
// ============================
router.get('/summary', protect, getFinanceSummary);
router.get('/filter', protect, filterFinance);
router.get('/category-stats', protect, getCategoryStats);
router.get('/monthly-stats', protect, getMonthlyStats);
router.get('/report', protect, getFinanceReportByPeriod);


// ============================
// MAIN CRUD ROUTES
// ============================
router.route('/')
  .get(protect, getFinances)
  .post(protect, createFinance);

router.route('/:id')
  .put(protect, updateFinance)
  .delete(protect, deleteFinance);

module.exports = router;
