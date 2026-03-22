const db       = require('../config/db');
const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreToTier(score) {
  if (score <= 20) return 'Good';
  if (score <= 40) return 'Fair';
  if (score <= 60) return 'Poor';
  if (score <= 80) return 'Severe';
  return 'Critical';
}

function tierPriority(tier) {
  return { Good: 1, Fair: 2, Poor: 3, Severe: 4, Critical: 5 }[tier] || 0;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R     = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat  = toRad(lat2 - lat1);
  const dLon  = toRad(lon2 - lon1);
  const a     = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── AI Service ───────────────────────────────────────────────────────────────
async function callAIService(imagePath) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));
  const res = await axios.post(process.env.AI_SERVICE_URL, formData, {
    headers: formData.getHeaders(),
    timeout: 30000,
  });
  return res.data;
}

// ─── Deduplication ────────────────────────────────────────────────────────────
const DEDUP_RADIUS_M = 15;
const LAT_DELTA      = 0.000135;
const LON_DELTA      = 0.000160;

function findNearbyCluster(lat, lng) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM clusters
       WHERE latitude  BETWEEN ? AND ?
         AND longitude BETWEEN ? AND ?
         AND status = 'Active'`,
      [lat - LAT_DELTA, lat + LAT_DELTA, lng - LON_DELTA, lng + LON_DELTA],
      (err, candidates) => {
        if (err) return reject(err);
        let closest = null, minDist = Infinity;
        for (const row of candidates) {
          const dist = getDistance(lat, lng, row.latitude, row.longitude);
          if (dist <= DEDUP_RADIUS_M && dist < minDist) {
            closest = row;
            minDist = dist;
          }
        }
        resolve(closest);
      }
    );
  });
}

function incrementCluster(clusterId, newScore) {
  return new Promise((resolve, reject) => {
    // Running average: new_avg = (old_avg * old_count + new_score) / new_count
    db.query(
      `UPDATE clusters
       SET damage_score = (damage_score * report_count + ?) / (report_count + 1),
           report_count = report_count + 1,
           modified_at  = NOW()
       WHERE id = ?`,
      [newScore, clusterId],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function createCluster(lat, lng, damageScore) {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO clusters (latitude, longitude, damage_score, report_count, status, created_at, modified_at)
       VALUES (?, ?, ?, 1, 'Active', NOW(), NOW())`,
      [lat, lng, damageScore],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });
}

// ─── Core Submit Logic (shared) ───────────────────────────────────────────────
async function _submitReport(type, req, res) {
  try {
    const { description, latitude, longitude } = req.body;

    if (!latitude || !longitude || !req.file) {
      return res.status(400).json({ error: 'latitude, longitude, and image are required' });
    }

    const lat      = parseFloat(latitude);
    const lng      = parseFloat(longitude);
    const imageUrl = req.file.filename;

    // Vehicle: AI runs onboard — results come in request body
    // User: no onboard AI — server calls the AI service
    let damageScore = 0, damageTier = 'Good', numDetections = 0;
    if (type === 'vehicle') {
      damageScore   = parseFloat(req.body.damage_score)   || 0;
      damageTier    = req.body.damage_tier                 || scoreToTier(damageScore);
      numDetections = parseInt(req.body.num_detections)   || 0;
    } else {
      try {
        const aiData  = await callAIService(req.file.path);
        damageScore   = aiData.damage_score   || 0;
        damageTier    = aiData.damage_tier    || 'Good';
        numDetections = aiData.num_detections || 0;
      } catch (aiErr) {
        console.error('AI service error:', aiErr.message);
        // Degrade gracefully — save report with score 0 rather than failing
      }
    }

    // Find or create cluster
    let clusterId;
    const nearbyCluster = await findNearbyCluster(lat, lng);
    if (nearbyCluster) {
      clusterId = nearbyCluster.id;
      await incrementCluster(clusterId, damageScore);
    } else {
      clusterId = await createCluster(lat, lng, damageScore);
    }

    // Insert report — always a new record, never mutated
    db.query(
      `INSERT INTO reports
         (type, description, latitude, longitude, image_url,
          damage_score, damage_tier, num_detections, cluster_id, status, last_seen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
      [type, description || null, lat, lng, imageUrl, damageScore, damageTier, numDetections, clusterId],
      (err, result) => {
        if (err) {
          console.error('DB insert error:', err);
          return res.status(500).json({ error: 'Failed to save report' });
        }
        res.status(201).json({
          message:      'Report submitted successfully',
          action:       nearbyCluster ? 'added to existing cluster' : 'new cluster created',
          reportId:     result.insertId,
          clusterId,
          damage_score: damageScore,
          damage_tier:  damageTier,
        });
      }
    );

  } catch (error) {
    console.error(`${type} report error:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── Public Handlers ──────────────────────────────────────────────────────────
const submitVehicleReport = (req, res) => _submitReport('vehicle', req, res);
const submitUserReport    = (req, res) => _submitReport('user',    req, res);

// ─── Get All Reports (admin) ──────────────────────────────────────────────────
const getAllReports = (req, res) => {
  db.query('SELECT * FROM reports ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};

// ─── Get Public Reports ───────────────────────────────────────────────────────
const getPublicReports = (req, res) => {
  db.query(
    `SELECT id, type, description, latitude, longitude, image_url,
            damage_score, damage_tier, report_count, status, last_seen
     FROM reports ORDER BY last_seen DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
};

// ─── Resolve Report ───────────────────────────────────────────────────────────
const resolveReport = (req, res) => {
  db.query(
    'UPDATE reports SET status = ? WHERE id = ?',
    ['Resolved', req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to resolve report' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Report not found' });
      res.json({ message: 'Report resolved successfully' });
    }
  );
};

// ─── Get Clusters (for map) ───────────────────────────────────────────────────
const getClusters = (req, res) => {
  db.query(
    `SELECT id, latitude, longitude, damage_score, report_count, status, created_at, modified_at
     FROM clusters
     ORDER BY report_count DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      // Attach damage_tier derived from damage_score
      const clusters = results
        .filter(c => c.latitude != null && c.longitude != null)
        .map(c => ({
          ...c,
          latitude:     parseFloat(c.latitude),
          longitude:    parseFloat(c.longitude),
          damage_score: parseFloat(c.damage_score || 0),
          damage_tier:  scoreToTier(parseFloat(c.damage_score || 0)),
        }));

      res.json(clusters);
    }
  );
};

module.exports = {
  submitVehicleReport,
  submitUserReport,
  getAllReports,
  getPublicReports,
  resolveReport,
  getClusters,
};