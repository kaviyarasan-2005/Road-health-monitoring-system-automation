const db = require('../config/db');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const submitReport = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const description = req.body.description;
    const location = req.body.location;

    // Validate required fields
    if (!description || !location || !req.file) {
      return res.status(400).json({ error: 'Description, location, and image are required' });
    }

    // Send image to AI model
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const aiResponse = await axios.post(
      process.env.AI_SERVICE_URL,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000 // 30 second timeout
      }
    );

    const damageScore = aiResponse.data.damage_score || 0;
    const imageUrl = req.file.filename;

    // Insert into database
    const query = 'INSERT INTO reports (description, location, image_url, damage_score, status) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [description, location, imageUrl, damageScore, 'Pending'], (err, result) => {
      if (err) {
        console.error('Database insert error:', err);
        return res.status(500).json({ error: 'Failed to save report' });
      }
      res.status(201).json({ message: 'Report submitted successfully', reportId: result.insertId });
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllReports = (req, res) => {
  db.query('SELECT * FROM reports ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

const getPublicReports = (req, res) => {
  db.query('SELECT * FROM reports ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

const resolveReport = (req, res) => {
  const id = req.params.id;
  db.query(
    'UPDATE reports SET status=? WHERE id=?',
    ['Resolved', id],
    (err, result) => {
      if (err) {
        console.error('Database update error:', err);
        return res.status(500).json({ error: 'Failed to resolve report' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json({ message: 'Report resolved successfully' });
    }
  );
};

const getClusters = (req, res) => {
  db.query('SELECT * FROM reports', (err, reports) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const clusters = [];

    // Haversine Distance Function (meters)
    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371000; // Earth radius in meters
      const toRad = (x) => x * Math.PI / 180;

      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    // Clustering Logic
    reports.forEach(report => {
      const [lat, lng] = report.location.split(',').map(Number);
      if (isNaN(lat) || isNaN(lng)) return; // Skip invalid locations

      let added = false;
      for (let cluster of clusters) {
        const distance = getDistance(cluster.lat, cluster.lng, lat, lng);
        if (distance < 500) { // 500 meters threshold
          cluster.reports.push(report);
          cluster.lat = (cluster.lat * cluster.reports.length + lat) / (cluster.reports.length + 1);
          cluster.lng = (cluster.lng * cluster.reports.length + lng) / (cluster.reports.length + 1);
          added = true;
          break;
        }
      }
      if (!added) {
        clusters.push({ lat, lng, reports: [report] });
      }
    });

    res.json(clusters);
  });
};

module.exports = {
  submitReport,
  getAllReports,
  getPublicReports,
  resolveReport,
  getClusters
};