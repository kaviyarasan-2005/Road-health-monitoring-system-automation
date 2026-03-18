const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  submitReport,
  getAllReports,
  getPublicReports,
  resolveReport,
  getClusters
} = require('../controllers/reportController');

// Public routes
router.post('/public/report', upload.single('image'), submitReport);
router.get('/public/reports', getPublicReports);

// Cluster route
router.get('/clusters', getClusters);

module.exports = router;