// ─── State ───────────────────────────────────────────────────────────────────
let allReports   = [];   // all reports from server
let activeFilter = 'all'; // 'all' | 'vehicle' | 'user'
let activeModal  = null;  // report object currently in modal

// ─── Boot ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadReports();

  document.getElementById('searchInput')
    .addEventListener('input', renderTable);
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function loadReports() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/reports');
    allReports = await res.json();

    if (!Array.isArray(allReports)) {
      console.error('Unexpected response:', allReports);
      allReports = [];
    }

    updateStatCards();
    renderTable();
  } catch (err) {
    console.error('Failed to load reports:', err);
  }
}

// ─── Stat cards (all time, not filtered) ─────────────────────────────────────
function updateStatCards() {
  const total    = allReports.length;
  const pending  = allReports.filter(r => r.status === 'Pending').length;
  const resolved = allReports.filter(r => r.status === 'Resolved').length;

  document.getElementById('totalCount').innerText   = total;
  document.getElementById('pendingCount').innerText  = pending;
  document.getElementById('resolvedCount').innerText = resolved;
}

// ─── Filter toggle ────────────────────────────────────────────────────────────
function setFilter(type) {
  activeFilter = type;

  // Update button styles
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  renderTable();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function is24h(report) {
  const created = new Date(report.created_at);
  return (Date.now() - created.getTime()) <= 24 * 60 * 60 * 1000;
}

function formatTime(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function tierColor(tier) {
  const map = {
    Good: '#00f593', Fair: '#00b4ff',
    Poor: '#ffaa00', Severe: '#ff7800', Critical: '#ff5c5c'
  };
  return map[tier] || '#8aa8c0';
}

function damageBarColor(score) {
  if (score <= 20) return '#00f593';
  if (score <= 40) return '#00b4ff';
  if (score <= 60) return '#ffaa00';
  if (score <= 80) return '#ff7800';
  return '#ff5c5c';
}

// ─── Render table ─────────────────────────────────────────────────────────────
function renderTable() {
  const tbody  = document.getElementById('reportTable');
  const search = document.getElementById('searchInput').value.toLowerCase();

  // 1 — last 24h only
  let filtered = allReports.filter(is24h);

  // 2 — type toggle
  if (activeFilter !== 'all') {
    filtered = filtered.filter(r => r.type === activeFilter);
  }

  // 3 — search (id, description, location, status)
  if (search) {
    filtered = filtered.filter(r =>
      String(r.id).includes(search) ||
      (r.description || '').toLowerCase().includes(search) ||
      (r.location    || '').toLowerCase().includes(search) ||
      (r.status      || '').toLowerCase().includes(search) ||
      (r.type        || '').toLowerCase().includes(search)
    );
  }

  // update count badge
  document.getElementById('tableCount').innerText = `${filtered.length} entries`;

  // empty state
  const emptyState = document.getElementById('emptyState');
  emptyState.style.display = filtered.length === 0 ? 'block' : 'none';

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    return;
  }

  tbody.innerHTML = filtered.map(report => {
    const lat = report.latitude  || '';
    const lng = report.longitude || '';
    const locationText = lat && lng
      ? `${parseFloat(lat).toFixed(5)}, ${parseFloat(lng).toFixed(5)}`
      : (report.location || 'N/A');

    const score   = parseFloat(report.damage_score) || 0;
    const tier    = report.damage_tier || '—';
    const tierCls = tier !== '—' ? `tier-${tier}` : '';

    const statusBadge = report.status === 'Resolved'
      ? `<span class="badge badge-resolved">Resolved</span>`
      : `<span class="badge badge-pending">Pending</span>`;

    const typeBadge = `<span class="type-chip type-${report.type}">${report.type}</span>`;

    return `
      <tr>
        <td>${report.id}</td>
        <td>
          <img src="http://localhost:3000/uploads/${report.image_url}"
               alt="report" onerror="this.src='https://placehold.co/68x48/0f1620/4e718c?text=N/A'"/>
        </td>
        <td>${typeBadge}</td>
        <td style="font-size:12px; color:var(--text-2);">${locationText}</td>
        <td>
          ${tier !== '—' ? `<span class="tier-badge ${tierCls}">${tier}</span>` : '—'}
          <div style="font-size:10px;color:var(--muted);margin-top:3px;">${score.toFixed(1)}%</div>
        </td>
        <td>${statusBadge}</td>
        <td style="font-size:11px;color:var(--text-2);">${formatTime(report.created_at)}</td>
        <td>
          <button class="btn-view" onclick="openModal(${report.id})">View</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal(id) {
  const report = allReports.find(r => r.id === id);
  if (!report) return;

  activeModal = report;

  const score = parseFloat(report.damage_score) || 0;
  const tier  = report.damage_tier || '—';

  // Image
  document.getElementById('modalImage').src =
    `http://localhost:3000/uploads/${report.image_url}`;

  // Title
  document.getElementById('modalId').innerText = `#${report.id}`;

  // Badges
  const typeBadge = document.getElementById('modalTypeBadge');
  typeBadge.className = `type-chip type-${report.type}`;
  typeBadge.innerText = report.type;

  const statusBadge = document.getElementById('modalStatusBadge');
  statusBadge.className = report.status === 'Resolved'
    ? 'badge badge-resolved' : 'badge badge-pending';
  statusBadge.innerText = report.status;

  const tierBadge = document.getElementById('modalTierBadge');
  tierBadge.className = `tier-badge tier-${tier}`;
  tierBadge.innerText = tier;

  // Fields
  const lat = report.latitude  ? parseFloat(report.latitude).toFixed(6)  : null;
  const lng = report.longitude ? parseFloat(report.longitude).toFixed(6) : null;

  document.getElementById('modalLocation').innerText =
    report.location || (lat && lng ? `${lat}, ${lng}` : 'N/A');

  document.getElementById('modalCreatedAt').innerText =
    formatTime(report.created_at);

  document.getElementById('modalDamageScore').innerText =
    `${score.toFixed(2)}%`;

  // Damage bar
  const bar = document.getElementById('modalDamageBar');
  bar.style.width = `${Math.min(score, 100)}%`;
  bar.style.background = damageBarColor(score);

  document.getElementById('modalDetections').innerText =
    report.num_detections != null ? report.num_detections : 'N/A';

  document.getElementById('modalCoords').innerText =
    lat && lng ? `${lat}, ${lng}` : 'N/A';

  document.getElementById('modalCluster').innerText =
    report.cluster_id != null ? `Cluster #${report.cluster_id}` : 'None';

  document.getElementById('modalDescription').innerText =
    report.description || 'No description provided.';

  // Disable resolve button if already resolved
  const resolveBtn = document.querySelector('.btn-modal-resolve');
  resolveBtn.disabled = report.status === 'Resolved';
  resolveBtn.style.opacity = report.status === 'Resolved' ? '0.4' : '1';

  document.getElementById('reportModal').classList.add('open');
}

function closeModal() {
  document.getElementById('reportModal').classList.remove('open');
  activeModal = null;
}

// Close on overlay click
document.getElementById('reportModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ─── Modal Actions ────────────────────────────────────────────────────────────
async function resolveFromModal() {
  if (!activeModal) return;

  try {
    const res = await fetch(`http://localhost:3000/api/admin/resolve/${activeModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' })
    });

    if (res.ok) {
      // update local state
      const report = allReports.find(r => r.id === activeModal.id);
      if (report) report.status = 'Resolved';

      updateStatCards();
      renderTable();
      closeModal();
    } else {
      alert('Failed to resolve report.');
    }
  } catch (err) {
    console.error(err);
    alert('Error resolving report.');
  }
}

async function deleteFromModal() {
  if (!activeModal) return;
  if (!confirm(`Delete report #${activeModal.id}? This cannot be undone.`)) return;

  try {
    const res = await fetch(`http://localhost:3000/api/admin/delete/${activeModal.id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      allReports = allReports.filter(r => r.id !== activeModal.id);
      updateStatCards();
      renderTable();
      closeModal();
    } else {
      alert('Failed to delete report.');
    }
  } catch (err) {
    console.error(err);
    alert('Error deleting report.');
  }
}