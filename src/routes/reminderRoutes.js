const express = require('express');
const {
  getReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getReminders).post(protect, createReminder);
router
  .route('/:id')
  .put(protect, updateReminderStatus)
  .delete(protect, deleteReminder);

module.exports = router;