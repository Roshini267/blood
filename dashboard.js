// js/dashboard.js — Premium Main Dashboard Logic

let map, chartInstance;

// ── Init on load ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Ensure global array state is available before processing rows
  if (typeof BLOOD_BANKS !== 'undefined') {
    renderScarcityTable(BLOOD_BANKS);
    initMap();
    initChart();
    simulateLiveUpdates();
  } else {
    console.error("RaktSetu Warning: js/data.js cluster configurations missing or inaccessible.");
  }
});

// ── Scarcity Table ───────────────────────────────────────────
function renderScarcityTable(banks) {
  const tbody = document.getElementById('scarcityBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (banks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:32px; color:var(--text-muted); font-style:italic;">No active logistics grids found matching those operational filter states.</td></tr>`;
    return;
  }

  banks.forEach(bank => {
    const status = getBankStatus(bank.stock);
    const statusLabel = { critical: '🔴 Critical', low: '🟡 Low', available: '🟢 Available' }[status];
    
    const row = document.createElement('tr');
    row.className = `row-${status}`;
    row.setAttribute('data-city', bank.city.toLowerCase());
    row.setAttribute('data-status', status);
    
    const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const stockCells = groups.map(g => {
      const v = bank.stock[g] !== undefined ? bank.stock[g] : 0;
      const cls = v === 0 ? 'cell-zero' : v <= 2 ? 'cell-critical' : v <= 10 ? 'cell-low' : 'cell-ok';
      return `<td class="${cls}" style="text-align:center; font-weight:600;">${v}</td>`;
    }).join('');
    
    row.innerHTML = `
      <td><strong>${bank.name}</strong><br/><small style="color:var(--text-muted);">${bank.phone || 'N/A'}</small></td>
      <td><strong>📍 ${bank.city}</strong></td>
      ${stockCells}
      <td><span class="badge badge-${status}">${statusLabel}</span></td>
      <td><small style="color:var(--text-muted); font-variant-numeric: tabular-nums;">${bank.lastUpdated}</small></td>
    `;
    tbody.appendChild(row);
  });
}

function filterGrid() {
  const cityEl = document.getElementById('cityFilter');
  const groupEl = document.getElementById('groupFilter');
  const statusEl = document.getElementById('statusFilter');

  const city = cityEl ? cityEl.value.toLowerCase().trim() : '';
  const group = groupEl ? groupEl.value : '';
  const status = statusEl ? statusEl.value : '';

  let filtered = BLOOD_BANKS.filter(b => {
    const cityMatch = b.city.toLowerCase().includes(city);
    const statusMatch = !status || getBankStatus(b.stock) === status;
    const groupMatch = !group || (b.stock[group] !== undefined && b.stock[group] > 0);
    return cityMatch && statusMatch && groupMatch;
  });

  if (group) {
    filtered = [...filtered].sort((a, b) => (b.stock[group] || 0) - (a.stock[group] || 0));
  }
  renderScarcityTable(filtered);
}

// ── Leaflet Map ──────────────────────────────────────────────
function initMap() {
  const mapContainer = document.getElementById('mainMap');
  if (!mapContainer) return;

  map = L.map('mainMap').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  updateMapMarkers();
}

function updateMapMarkers() {
  if (!map) return;
  
  // Clear pre-existing layers before fresh instantiation traces
  map.eachLayer(layer => {
    if (layer instanceof L.CircleMarker) {
      map.removeLayer(layer);
    }
  });

  BLOOD_BANKS.forEach(bank => {
    const status = getBankStatus(bank.stock);
    const color = { critical: '#ef4444', low: '#f59e0b', available: '#22c55e' }[status];
    
    const marker = L.circleMarker([bank.lat, bank.lng], {
      radius: 12, 
      fillColor: color, 
      color: '#fff',
      weight: 2, 
      opacity: 1, 
      fillOpacity: 0.85
    }).addTo(map);

    const stockRows = Object.entries(bank.stock).map(([g, v]) =>
      `<tr><td style="padding:2px 8px; font-weight:600; border-bottom:1px solid #f1f5f9;">${g}</td><td style="padding:2px 8px; text-align:right; font-weight:700; color:${v===0?'#ef4444':v<=2?'#f59e0b':'#22c55e'}">${v} u</td></tr>`
    ).join('');

    marker.bindPopup(`
      <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; min-width:220px; padding:4px;">
        <strong style="font-size:14px; color:#0f172a;">${bank.name}</strong>
        <p style="margin:2px 0 8px 0; color:#64748b; font-size:12px;">📍 ${bank.city}</p>
        <table style="width:100%; font-size:12px; border-collapse:collapse; margin-bottom:12px;">${stockRows}</table>
        <div style="display:flex; gap:8px;">
          <a href="pages/emergency.html" style="flex:1; text-align:center; background:#ef4444; color:white; padding:6px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:600;">🚨 Request</a>
          <a href="tel:${bank.phone}" style="flex:1; text-align:center; background:#4f46e5; color:white; padding:6px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:600;">📞 Contact</a>
        </div>
      </div>
    `);
  });
}

// ── Chart.js Bar Chart ───────────────────────────────────────
function initChart() {
  const chartCanvas = document.getElementById('availabilityChart');
  if (!chartCanvas) return;

  const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const totals = groups.map(g => BLOOD_BANKS.reduce((sum, b) => sum + (b.stock[g] || 0), 0));
  const ctx = chartCanvas.getContext('2d');
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: groups,
      datasets: [{
        label: 'Total Available Units',
        data: totals,
        backgroundColor: totals.map(v => v === 0 ? '#ef4444' : v < 10 ? '#f59e0b' : '#10b981'),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: context => ` ${context.parsed.y} live units` } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', weight: '600', size: 12 } } }
      }
    }
  });
}

// ── Simulate Live Updates (WebSocket simulation) ─────────────
function simulateLiveUpdates() {
  setInterval(() => {
    if (!BLOOD_BANKS || BLOOD_BANKS.length === 0) return;

    // Randomly tweak stock in one bank
    const bank = BLOOD_BANKS[Math.floor(Math.random() * BLOOD_BANKS.length)];
    const groups = Object.keys(bank.stock);
    const g = groups[Math.floor(Math.random() * groups.length)];
    const delta = Math.random() > 0.45 ? 1 : -1;
    
    bank.stock[g] = Math.max(0, bank.stock[g] + delta);
    bank.lastUpdated = 'Just now';

    // Recalculate global statistical metrics
    const overallUnits = BLOOD_BANKS.reduce((sum, b) => sum + Object.values(b.stock).reduce((a, v) => a + v, 0), 0);
    animateStat('statUnits', overallUnits);
    
    // Refresh elements and interactive map views sequentially
    const cityFilterEl = document.getElementById('cityFilter');
    if (cityFilterEl && (cityFilterEl.value !== '')) {
      filterGrid();
    } else {
      renderScarcityTable(BLOOD_BANKS);
    }
    
    // Smoothly refresh chart nodes without destructive redraw spikes
    if (chartInstance) {
      const targetLabels = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
      const newTotals = targetLabels.map(label => BLOOD_BANKS.reduce((sum, b) => sum + (b.stock[label] || 0), 0));
      
      chartInstance.data.datasets[0].data = newTotals;
      chartInstance.data.datasets[0].backgroundColor = newTotals.map(v => v === 0 ? '#ef4444' : v < 10 ? '#f59e0b' : '#10b981');
      chartInstance.update('none'); // Update smoothly without loading animations
    }
  }, 8000);
}

function animateStat(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'transform 0.15s ease';
  el.style.transform = 'scale(1.08)';
  el.textContent = target.toLocaleString('en-IN');
  setTimeout(() => el.style.transform = 'scale(1)', 150);
}

// ── Hero Search ──────────────────────────────────────────────
function heroSearch() {
  const groupEl = document.getElementById('heroBloodGroup');
  const cityEl = document.getElementById('heroCityInput');
  
  const group = groupEl ? groupEl.value : '';
  const city = cityEl ? cityEl.value.toLowerCase().trim() : '';
  
  if (!group && !city) { 
    alert('Please choose a target group classification metric or locale query.'); 
    return; 
  }

  const groupFilter = document.getElementById('groupFilter');
  const cityFilter = document.getElementById('cityFilter');

  if (groupFilter) groupFilter.value = group;
  if (cityFilter) cityFilter.value = city;
  
  filterGrid();
  
  const destinationTable = document.querySelector('.scarcity-table');
  if (destinationTable) {
    destinationTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}