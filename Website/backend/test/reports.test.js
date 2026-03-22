const axios    = require('axios');
const FormData = require('form-data');
const fs       = require('fs');
const path     = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL   = 'http://localhost:3000/api';
const TEST_IMAGE = path.join(__dirname, '../../../Z_Test_Assets/dmg2.jpg'); // put any test image here
const DELAY_MS   = 300; // delay between requests to avoid overwhelming the server

//console.log(TEST_IMAGE);

// ─── Test Data ────────────────────────────────────────────────────────────────
// Groups A and B are intentionally close (within 15m) → should merge into 1 cluster each
// Group C is far away → separate cluster
const reports = [
  // Group E — 3 reports, severe cluster → 1 cluster (avg score ~72)
  { type: 'vehicle', lat: 19.082300, lng: 72.883100, damage_score: 88.0, damage_tier: 'Critical', num_detections: 5, description: 'Group E - vehicle 1' },
  { type: 'vehicle', lat: 19.082308, lng: 72.883112, damage_score: 71.0, damage_tier: 'Severe',   num_detections: 3, description: 'Group E - vehicle 2' },
  { type: 'user',    lat: 19.082295, lng: 72.883095, description: 'Group E - user 1' },

  // Group F — 3 reports, mild damage → 1 cluster (avg score ~25)
  { type: 'vehicle', lat: 19.091500, lng: 72.891200, damage_score: 35.0, damage_tier: 'Fair',     num_detections: 2, description: 'Group F - vehicle 1' },
  { type: 'vehicle', lat: 19.091508, lng: 72.891210, damage_score: 18.0, damage_tier: 'Good',     num_detections: 1, description: 'Group F - vehicle 2' },
  { type: 'user',    lat: 19.091495, lng: 72.891195, description: 'Group F - user 1' },

  // Group G — 2 reports, poor condition → 1 cluster (avg score ~52)
  { type: 'vehicle', lat: 19.310000, lng: 72.950000, damage_score: 58.0, damage_tier: 'Poor',     num_detections: 3, description: 'Group G - vehicle 1' },
  { type: 'user',    lat: 19.310004, lng: 72.950005, description: 'Group G - user 1' },

  // Group H — 1 report, standalone → 1 cluster
  { type: 'vehicle', lat: 19.450000, lng: 73.010000, damage_score: 44.0, damage_tier: 'Poor',     num_detections: 2, description: 'Group H - isolated vehicle' },

  // Group I — 1 report, standalone → 1 cluster
  { type: 'vehicle', lat: 19.550000, lng: 73.100000, damage_score: 95.0, damage_tier: 'Critical', num_detections: 6, description: 'Group I - isolated critical' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function sendReport(report) {
  const form = new FormData();
  form.append('image',       fs.createReadStream(TEST_IMAGE));
  form.append('latitude',    report.lat.toString());
  form.append('longitude',   report.lng.toString());
  form.append('description', report.description);

  if (report.type === 'vehicle') {
    form.append('damage_score',   report.damage_score.toString());
    form.append('damage_tier',    report.damage_tier);
    form.append('num_detections', report.num_detections.toString());
  }

  const url = report.type === 'vehicle'
    ? `${BASE_URL}/vehicle/report`
    : `${BASE_URL}/public/report`;
  const res = await axios.post(url, form, { headers: form.getHeaders() });
  return res.data;
}

// ─── Runner ───────────────────────────────────────────────────────────────────
async function runBulkTest() {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Sending ${reports.length} reports to ${BASE_URL}`);
  console.log(`Test image: ${TEST_IMAGE}`);
  console.log('─'.repeat(60));

  const results = { created: 0, merged: 0, failed: 0 };

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    process.stdout.write(`[${i + 1}/${reports.length}] ${report.type.padEnd(7)} (${report.lat}, ${report.lng}) → `);

    try {
      const data = await sendReport(report);
      const action = data.action || 'unknown';

      if (action.includes('merged') || action.includes('existing')) {
        results.merged++;
        console.log(`MERGED   into cluster #${data.clusterId}`);
      } else {
        results.created++;
        console.log(`CREATED  report #${data.reportId}, cluster #${data.clusterId}`);
      }
    } catch (err) {
      results.failed++;
      const msg = err.response?.data?.error || err.message;
      console.log(`FAILED   ${msg}`);
    }

    if (i < reports.length - 1) await delay(DELAY_MS);
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Summary:');
  console.log(`  New reports created : ${results.created}`);
  console.log(`  Merged into cluster : ${results.merged}`);
  console.log(`  Failed              : ${results.failed}`);
  console.log('─'.repeat(60));
  console.log('\nExpected clusters: 5 (Groups E, F, G, H, I)');
  console.log('Expected report_count per cluster: 3, 3, 2, 1, 1');
  console.log('Expected avg damage_score per cluster: ~79.5, ~26.5, ~58, ~44, ~95');
}

runBulkTest();