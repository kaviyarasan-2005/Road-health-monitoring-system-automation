const express = require('express');
const router = express.Router();
const {
  getAllReports,
  resolveReport,
  deleteReport,
  getReportStats,
  getAllUsers,
  updateUserRole
} = require('../controllers/adminController');

// Report routes
router.get('/reports', getAllReports);
router.put('/resolve/:id', resolveReport);
router.delete('/delete/:id', deleteReport);
router.get('/stats', getReportStats);

// User routes
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;