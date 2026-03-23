// reportRoutes
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  submitVehicleReport,
  submitUserReport,
  getAllReports,
  getPublicReports,
  resolveReport,
  getUserReports,
  getClusters,
  resolveCluster, 
} = require('../controllers/reportController');

// Public routes
router.post('/public/report', upload.single('image'), submitUserReport);
router.get('/public/reports', getPublicReports);

//user-specific route
router.get('/user/:userId/reports', getUserReports);

//vehicle routes
router.post('/vehicle/report', upload.single('image'), submitVehicleReport);

// Cluster route
router.get('/clusters', getClusters);
router.put('/clusters/:id', resolveCluster);
module.exports = router;