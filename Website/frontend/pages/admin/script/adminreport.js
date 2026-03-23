// ─── State ───────────────────────────────────────────────────────────────────
let allReports  = [];
let allClusters = [];
let activeView   = 'clusters';   // 'clusters' | 'reports'
let activeFilter = 'All';        // 'All' | 'Pending' | 'Under Process' | 'Resolved'
let activeCluster = null;        // cluster object currently open in modal

const BASE = 'http://localhost:3000';

// ─── Boot ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadAll();
  document.getElementById('searchInput').addEventListener('input', renderActive);
});

async function loadAll() {
  await Promise.all([fetchReports(), fetchClusters()]);
  updateStatCards();
  renderActive();
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchReports() {
  try {
    const res = await fetch(`${BASE}/api/admin/reports`);
    const data = await res.json();
    allReports = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Failed to load reports:', e);
    allReports = [];
  }
}

async function fetchClusters() {
  try {
    const res = await fetch(`${BASE}/api/clusters`);
    const data = await res.json();
    allClusters = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Failed to load clusters:', e);
    allClusters = [];
  }
}

// ─── Stat cards ───────────────────────────────────────────────────────────────
function updateStatCards() {
  // base stats on clusters when in cluster view, else reports
  const source = allClusters;
  document.getElementById('totalCount').innerText   = source.length;
  document.getElementById('pendingCount').innerText  = source.filter(c => c.status === 'Active' || c.status === 'Pending').length;
  document.getElementById('processCount').innerText  = source.filter(c => c.status === 'Under Process').length;
  document.getElementById('resolvedCount').innerText = source.filter(c => c.status === 'Resolved').length;
}

// ─── View switch ──────────────────────────────────────────────────────────────
function switchView(view) {
  activeView = view;
  document.querySelectorAll('.view-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === view));
  document.getElementById('clusterSection').classList.toggle('visible', view === 'clusters');
  document.getElementById('reportSection').classList.toggle('visible',  view === 'reports');
  renderActive();
}

// ─── Filter tab ───────────────────────────────────────────────────────────────
function setFilter(btn) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.value;
  renderActive();
}

// ─── Render dispatcher ───────────────────────────────────────────────────────
function renderActive() {
  if (activeView === 'clusters') renderClusters();
  else renderReports();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreToTier(score) {
  if (score <= 20) return 'Good';
  if (score <= 40) return 'Fair';
  if (score <= 60) return 'Poor';
  if (score <= 80) return 'Severe';
  return 'Critical';
}

function tierColor(tier) {
  return { Good:'#00f593', Fair:'#00b4ff', Poor:'#ffaa00', Severe:'#ff7800', Critical:'#ff5c5c' }[tier] || '#8aa8c0';
}

function formatTime(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function clusterStatusLabel(raw) {
  // API returns 'Active' for clusters not yet set; map to Pending visually
  if (raw === 'Active') return 'Pending';
  return raw || 'Pending';
}

function search() {
  return document.getElementById('searchInput').value.toLowerCase();
}

// ─── Render Clusters ──────────────────────────────────────────────────────────
function renderClusters() {
  const tbody = document.getElementById('clusterTable');
  const q     = search();

  let list = allClusters.filter(c => {
    const statusLabel = clusterStatusLabel(c.status);
    if (activeFilter !== 'All' && statusLabel !== activeFilter) return false;
    if (q) {
      const coord = `${c.latitude}, ${c.longitude}`;
      if (!coord.includes(q) && !statusLabel.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  document.getElementById('clusterEmpty').style.display = list.length === 0 ? 'block' : 'none';

  if (list.length === 0) { tbody.innerHTML = ''; return; }

  tbody.innerHTML = list.map(c => {
    const score  = parseFloat(c.damage_score) || 0;
    const tier   = scoreToTier(score);
    const status = clusterStatusLabel(c.status);

    const statusCls = status.replace(' ', '-');

    return `
      <tr>
        <td>${c.id}</td>
        <td class="td-location" style="font-size:12px;color:var(--text-2);">
          ${parseFloat(c.latitude).toFixed(5)}, ${parseFloat(c.longitude).toFixed(5)}
        </td>
        <td style="text-align:center;">
          <span style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--blue-bright);">${c.report_count}</span>
        </td>
        <td>
          <span class="tier-badge tier-${tier}">${tier}</span>
          <span style="font-size:11px;color:var(--muted);margin-left:6px;">${score.toFixed(1)}%</span>
          <div class="score-bar-track">
            <div class="score-bar-fill" style="width:${Math.min(score,100)}%;background:${tierColor(tier)};"></div>
          </div>
        </td>
        <td><span class="cs-badge cs-${statusCls}">${status}</span></td>
        <td style="font-size:11px;color:var(--text-2);">${formatTime(c.created_at)}</td>
        <td>
          <button class="view-report-btn" onclick="openClusterModal(${c.id})">View</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Render Individual Reports ────────────────────────────────────────────────
function renderReports() {
  const tbody = document.getElementById('reportTable');
  const q     = search();

  let list = allReports.filter(r => {
    if (activeFilter !== 'All' && r.status !== activeFilter) return false;
    if (q) {
      const hay = `${r.id} ${r.description||''} ${r.location||''} ${r.status||''} ${r.type||''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  document.getElementById('reportEmpty').style.display = list.length === 0 ? 'block' : 'none';

  if (list.length === 0) { tbody.innerHTML = ''; return; }

  tbody.innerHTML = list.map(r => {
    const lat = r.latitude  ? parseFloat(r.latitude).toFixed(5)  : null;
    const lng = r.longitude ? parseFloat(r.longitude).toFixed(5) : null;
    const loc = r.location || (lat && lng ? `${lat}, ${lng}` : 'N/A');
    const score = parseFloat(r.damage_score) || 0;
    const tier  = r.damage_tier || scoreToTier(score);

    const statusBadge = r.status === 'Resolved'
      ? `<span class="badge badge-resolved">Resolved</span>`
      : `<span class="badge badge-pending">${r.status || 'Pending'}</span>`;

    return `
      <tr>
        <td>${r.id}</td>
        <td>
          <img src="${BASE}/uploads/${r.image_url}"
               onerror="this.src='https://placehold.co/72x52/0f1620/4e718c?text=N/A'" />
        </td>
        <td><span class="type-chip type-${r.type}">${r.type}</span></td>
        <td class="td-location">${loc}</td>
        <td class="td-desc">${r.description || '—'}</td>
        <td>
          <span class="tier-badge tier-${tier}">${tier}</span>
          <div style="font-size:10px;color:var(--muted);margin-top:2px;">${score.toFixed(1)}%</div>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-group">
            <button class="resolve-btn" onclick="resolveReport(${r.id})">Resolve</button>
            <button class="delete-btn"  onclick="deleteReport(${r.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Individual report actions ────────────────────────────────────────────────
async function resolveReport(id) {
  if (!confirm(`Mark report #${id} as Resolved?`)) return;
  try {
    await fetch(`${BASE}/api/admin/resolve/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' })
    });
    await fetchReports();
    renderReports();
  } catch (e) { alert('Failed to resolve report.'); }
}

async function deleteReport(id) {
  if (!confirm(`Delete report #${id}? This cannot be undone.`)) return;
  try {
    await fetch(`${BASE}/api/admin/delete/${id}`, { method: 'DELETE' });
    await fetchReports();
    renderReports();
  } catch (e) { alert('Failed to delete report.'); }
}

// ─── Cluster Modal ────────────────────────────────────────────────────────────
function openClusterModal(clusterId) {
  const cluster = allClusters.find(c => c.id === clusterId);
  if (!cluster) return;
  activeCluster = cluster;

  const score  = parseFloat(cluster.damage_score) || 0;
  const tier   = scoreToTier(score);
  const status = clusterStatusLabel(cluster.status);

  // Header
  document.getElementById('modalClusterId').innerText = `#${cluster.id}`;

  const sb = document.getElementById('modalClusterStatus');
  sb.className = `cs-badge cs-${status.replace(' ', '-')}`;
  sb.innerText = status;

  const tb = document.getElementById('modalClusterTier');
  tb.className = `tier-badge tier-${tier}`;
  tb.innerText = tier;

  document.getElementById('modalClusterCoords').innerText =
    `${parseFloat(cluster.latitude).toFixed(6)}, ${parseFloat(cluster.longitude).toFixed(6)}`;

  // Info cards
  document.getElementById('modalAvgScore').innerText  = `${score.toFixed(2)}%`;
  document.getElementById('modalReportCount').innerText = cluster.report_count;
  document.getElementById('modalCreatedAt').innerText  = formatTime(cluster.created_at);
  document.getElementById('modalModifiedAt').innerText = formatTime(cluster.modified_at);

  const bar = document.getElementById('modalScoreBar');
  bar.style.width      = `${Math.min(score,100)}%`;
  bar.style.background = tierColor(tier);

  // Status select — map 'Active' → 'Pending'
  const sel = document.getElementById('modalStatusSelect');
  sel.value = status === 'Active' ? 'Pending' : status;

  // Reports belonging to this cluster
  const clusterReports = allReports.filter(r => r.cluster_id === cluster.id);
  const listEl = document.getElementById('modalReportsList');

  if (clusterReports.length === 0) {
    listEl.innerHTML = `<p style="color:var(--muted);font-size:13px;">No individual reports linked to this cluster.</p>`;
  } else {
    listEl.innerHTML = clusterReports.map(r => {
      const rScore = parseFloat(r.damage_score) || 0;
      const rTier  = r.damage_tier || scoreToTier(rScore);
      return `
        <div class="cluster-report-card">
          <img src="${BASE}/uploads/${r.image_url}"
               onerror="this.src='https://placehold.co/80x56/0f1620/4e718c?text=N/A'" />
          <div class="cluster-report-info">
            <div class="cluster-report-top">
              <span class="cluster-report-id">#${r.id}</span>
              <span class="type-chip type-${r.type}">${r.type}</span>
              <span class="tier-badge tier-${rTier}">${rTier}</span>
              <span style="font-size:11px;color:var(--muted);">${rScore.toFixed(1)}%</span>
            </div>
            <div class="cluster-report-desc">${r.description || 'No description'}</div>
            <div class="cluster-report-meta">
              <span>🔍 ${r.num_detections || 0} detections</span>
              <span>🕐 ${formatTime(r.created_at)}</span>
              ${r.latitude ? `<span>📌 ${parseFloat(r.latitude).toFixed(5)}, ${parseFloat(r.longitude).toFixed(5)}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('clusterModal').classList.add('open');
}

function closeModal() {
  document.getElementById('clusterModal').classList.remove('open');
  activeCluster = null;
}

// Close on overlay click
document.getElementById('clusterModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ─── Update cluster status ────────────────────────────────────────────────────
async function updateClusterStatus() {
  if (!activeCluster) return;
  const newStatus = document.getElementById('modalStatusSelect').value;

  // If Resolved → delete from DB as per requirement
  if (newStatus === 'Resolved') {
    if (!confirm(`Marking as Resolved will permanently delete Cluster #${activeCluster.id} and all its reports from the database. Continue?`)) return;
    await deleteCluster(true); // silent = true (no second confirm)
    return;
  }

  try {
    // Use the cluster update endpoint — adjust path to match your backend
    const res = await fetch(`${BASE}/api/clusters/${activeCluster.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      // update local state
      const c = allClusters.find(c => c.id === activeCluster.id);
      if (c) c.status = newStatus;
      updateStatCards();
      renderClusters();

      // update badge in modal
      const sb = document.getElementById('modalClusterStatus');
      sb.className = `cs-badge cs-${newStatus.replace(' ', '-')}`;
      sb.innerText = newStatus;

      activeCluster.status = newStatus;
    } else {
      alert('Failed to update status. Check your backend has PUT /api/admin/clusters/:id');
    }
  } catch (e) {
    console.error(e);
    alert('Error updating cluster status.');
  }
}

// ─── Delete cluster ───────────────────────────────────────────────────────────
async function deleteCluster(silent = false) {
  if (!activeCluster) return;
  if (!silent && !confirm(`Delete Cluster #${activeCluster.id} and ALL its reports? This cannot be undone.`)) return;

  try {
    const res = await fetch(`${BASE}/api/clusters/${activeCluster.id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      // Remove cluster and its reports from local state
      allClusters = allClusters.filter(c => c.id !== activeCluster.id);
      allReports  = allReports.filter(r => r.cluster_id !== activeCluster.id);
      updateStatCards();
      renderActive();
      closeModal();
    } else {
      alert('Failed to delete cluster. Check your backend has DELETE /api/admin/clusters/:id');
    }
  } catch (e) {
    console.error(e);
    alert('Error deleting cluster.');
  }
}