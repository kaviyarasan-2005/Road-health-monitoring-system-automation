const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  submitVehicleReport,
  submitUserReport,
  getAllReports,
  getPublicReports,
  resolveReport,
  getClusters,
} = require('../controllers/reportController');

// Public routes
router.post('/public/report', upload.single('image'), submitUserReport);
router.get('/public/reports', getPublicReports);

//vehicle routes
router.post('/vehicle/report', upload.single('image'), submitVehicleReport);

// Cluster route
router.get('/clusters', getClusters);

module.exports = router;