// js/emergency.js — Premium Emergency Routing, Call Loop, and Tracker Logic

let routeMapInstance = null;
let transitMapInstance = null;

window.addEventListener('DOMContentLoaded', () => {
  renderActiveRequests();
});

// ── Render Active Emergency Request Logs ───────────────────────
function renderActiveRequests() {
  const list = document.getElementById('activeRequestsList');
  if (!list) return;

  if (typeof EMERGENCY_REQUESTS === 'undefined' || EMERGENCY_REQUESTS.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted); font-style:italic;">No live critical responses running in this grid region.</p>`;
    return;
  }

  list.innerHTML = EMERGENCY_REQUESTS.map(req => {
    const statusColor = { IN_TRANSIT: '#2563eb', SEARCHING: '#f59e0b', FULFILLED: '#10b981' }[req.status] || '#64748b';
    const statusIcon = { IN_TRANSIT: '🚑', SEARCHING: '🔍', FULFILLED: '✅' }[req.status] || '📋';
    
    return `
    <div class="request-card" style="border-left:4px solid ${statusColor}; background:#fff; padding:18px; border-radius:12px; border:1px solid var(--gray-200); margin-bottom:12px; box-shadow: var(--shadow);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-family:monospace; font-weight:700; color:var(--gray-400); font-size:12px;">${req.id}</span>
        <span style="background:${statusColor}; color:#fff; padding:4px 10px; border-radius:9999px; font-size:11px; font-weight:700;">${statusIcon} ${req.status.replace('_',' ')}</span>
      </div>
      <div style="font-size:1.2rem; font-weight:700; color:var(--gray-900); margin-bottom:6px;">
        Required: <span style="color:var(--red);">${req.bloodGroup}</span> — ${req.units} Units
      </div>
      <div style="font-size:0.9rem; font-weight:500; color:var(--gray-600); margin-bottom:4px;">🏥 ${req.hospital}</div>
      ${req.assignedBank ? `<div style="font-size:0.85rem; color:var(--gray-600);">🏦 Source Base: ${req.assignedBank}</div>` : '<div style="font-size:0.85rem; color:var(--yellow); font-weight:600;">⚠️ Scanning regional hubs...</div>'}
      ${req.etaMinutes ? `<div style="font-size:0.85rem; font-weight:700; margin-top:6px; color:var(--gray-900);">⏱ ETA: ${req.etaMinutes} mins | 📍 Distance: ${req.distanceKm} km</div>` : ''}
      
      <div style="font-size:11px; color:var(--gray-400); text-align:right; margin-top:12px; border-top:1px solid var(--gray-100); padding-top:8px;">
        Received: ${new Date(req.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </div>
      ${req.status === 'IN_TRANSIT' ? `<button class="btn-track" style="width:100%; margin-top:10px;" onclick="showTransitTracker('${req.assignedBank}', '${req.etaMinutes}')">📍 View Live Dispatch Tracker</button>` : ''}
    </div>`;
  }).join('');
}

// ── Emergency Handler: Distance Scan and Path Geolocation ────
function submitEmergency() {
  const hospital = document.getElementById('eHospital').value.trim();
  const bloodGroup = document.getElementById('eBloodGroup').value;
  const units = document.getElementById('eUnits').value;
  const phone = document.getElementById('ePhone').value.trim();

  if (!hospital || !bloodGroup || !phone) {
    if (typeof showToast === 'function') showToast('⚠️ Please assign target hospital and callback parameters.');
    else alert('Please provide required emergency coordinates details.');
    return;
  }

  document.getElementById('resultsPanel').style.display = 'block';
  document.getElementById('resultTitle').textContent = `Nearest Hubs for Group ${bloodGroup} — Real Driving Proximity`;

  // Filter banks that contain units matching the crisis parameters
  const banksWithStock = BLOOD_BANKS
    .filter(b => (b.stock[bloodGroup] || 0) > 0)
    .sort((a, b) => (b.stock[bloodGroup] || 0) - (a.stock[bloodGroup] || 0));

  renderBankResults(banksWithStock, bloodGroup, units);
  initRouteMap(banksWithStock, bloodGroup);

  const hasStock = banksWithStock.length > 0;
  setTimeout(() => triggerCallLoop(bloodGroup, !hasStock), 1000);

  document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Render Closest Storage Depot Hub Targets ─────────────────
function renderBankResults(banks, group, units) {
  const container = document.getElementById('bankResults');
  if (!container) return;

  if (banks.length === 0) {
    container.innerHTML = `
    <div style="padding:24px; border:1px dashed var(--red); background:var(--red-light); border-radius:12px; color:var(--red);">
      <h3 style="margin-bottom:6px;">⚠️ Zero System Depot Levels Detected for Group ${group}</h3>
      <p style="font-size:0.9rem;">Defaulting to automated peer broadcast loops to locate local emergency donor groups...</p>
    </div>`;
    return;
  }

  container.innerHTML = banks.slice(0, 3).map((bank, i) => {
    // Generate simulated driving metrics instead of clean radial straight lines
    const drivingDistance = (1.4 + i * 2.9).toFixed(1);
    const drivingETA  = (5 + i * 6);
    const volume = bank.stock[group];
    
    return `
    <div class="bank-result-card ${i === 0 ? 'recommended' : ''}" style="background:#fff; padding:20px; border:1px solid ${i===0?'var(--green)':'var(--gray-200)'}; border-radius:12px; margin-bottom:12px;">
      ${i === 0 ? '<div class="recommended-tag">🏆 OPTIMAL HUB — Fastest Driving Time ETA Vector</div>' : ''}
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <div>
          <strong style="color:var(--gray-900); font-size:1.1rem;">${bank.name}</strong>
          <span style="color:var(--gray-400); font-size:13px;"> • ${bank.city}</span>
        </div>
        <span class="blood-badge">${volume} Units Available</span>
      </div>
      <div style="display:flex; gap:16px; font-size:13px; color:var(--gray-600); margin-bottom:12px;">
        <span>🚗 Driving Distance: <strong>${drivingDistance} km</strong></span>
        <span>⏱ Estimated Travel Time: <strong>~${drivingETA} mins</strong></span>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-assign" style="flex:2;" onclick="assignBank('${bank.name}', '${drivingETA}')">Dispatch Courier Vehicle</button>
        <a href="tel:${bank.phone}" class="btn-call" style="flex:1; text-align:center; padding:10px; background:var(--gray-100); border-radius:8px; color:var(--gray-900); font-size:13px; font-weight:600;">📞 Call Center</a>
      </div>
    </div>`;
  }).join('');
}

function assignBank(name, eta) {
  if (typeof showToast === 'function') {
    showToast(`🚑 Courier assigned to "${name}". Real-time trajectory tracking running.`);
  }
  showTransitTracker(name, eta);
}

// ── Leaflet Core Driving Topography Intercept Map ───────────────
function initRouteMap(banks, group) {
  const mapElement = document.getElementById('routeMap');
  if (!mapElement) return;

  if (routeMapInstance) {
    routeMapInstance.remove();
    routeMapInstance = null;
  }

  // Centered point on default reference grid area (Tirupati coordinates)
  const baseHospitalLocation = [13.6288, 79.4192]; 
  routeMapInstance = L.map('routeMap').setView(baseHospitalLocation, 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(routeMapInstance);

  // Mark dropping location point
  L.marker(baseHospitalLocation, {
    icon: L.divIcon({ html: '<span style="font-size:26px;">🏥</span>', className: '', iconSize: [30, 30] })
  }).addTo(routeMapInstance).bindPopup('<b>Incident Hospital Target Node</b>');

  banks.slice(0, 3).forEach((bank, i) => {
    const routeColor = i === 0 ? 'var(--green)' : 'var(--gray-400)';
    
    L.circleMarker([bank.lat, bank.lng], {
      radius: i === 0 ? 14 : 10,
      fillColor: routeColor, 
      color: '#fff', 
      weight: 2,
      fillOpacity: 0.85
    }).addTo(routeMapInstance).bindPopup(`<b>${bank.name}</b><br>${bank.stock[group]} Units Match`);

    // Draw routing vector connections paths
    L.polyline([baseHospitalLocation, [bank.lat, bank.lng]], {
      color: routeColor, 
      weight: i === 0 ? 4 : 2, 
      dashArray: i === 0 ? '' : '5,5'
    }).addTo(routeMapInstance);
  });
}

// ── Automated Call Loop Node Telemetry ────────────────────────
function triggerCallLoop(bloodGroup, emergency = false) {
  const panel = document.getElementById('callLoopPanel');
  if (!panel) return;
  panel.style.display = 'block';

  if (typeof DONORS === 'undefined') return;

  const eligibleDonors = DONORS.filter(d => (d.bloodGroup === bloodGroup || bloodGroup === 'O-') && isDonorEligible(d));
  const cooldownDonors = DONORS.filter(d => d.bloodGroup === bloodGroup && !isDonorEligible(d));

  document.getElementById('callLoopStatus').innerHTML = `
    Found <strong>${eligibleDonors.length} active matching donors</strong> inside target grid vectors for type ${bloodGroup}.
    <br><span style="font-size:12px; color:var(--yellow); font-weight:600;">🛡️ Guard interceptor bypassed ${cooldownDonors.length} profiles via 90-day cooldown rules.</span>
  `;

  const list = document.getElementById('donorAlertList');
  if (eligibleDonors.length === 0) {
    list.innerHTML = `<p style="font-size:13px; color:var(--gray-400); font-style:italic; padding:8px 0;">No unflagged volunteer groups available locally. Widening tracking array radius coordinates...</p>`;
    return;
  }

  list.innerHTML = eligibleDonors.map((d, i) => `
    <div class="donor-alert-row" style="display:flex; justify-content:space-between; padding:12px; background:#fff; border:1px solid var(--gray-200); border-radius:8px; margin-bottom:6px;">
      <div>
        <strong>${d.name}</strong>
        <span class="donor-group-tag" style="margin-left:6px;">${d.bloodGroup}</span>
        <span style="color:var(--gray-400); font-size:12px;"> — 📍 ${d.city}</span>
      </div>
      <div style="font-size:12px; font-weight:700;">
        <span class="sms-status" id="sms-${d.id}" style="color:var(--gray-400);">📤 Dispatched line...</span>
        <span class="wa-status" id="wa-${d.id}" style="display:none; margin-left:8px; color:var(--green);">💬 WhatsApp Logged</span>
      </div>
    </div>
  `).join('');

  eligibleDonors.forEach((d, i) => {
    setTimeout(() => {
      const smsNode = document.getElementById(`sms-${d.id}`);
      const waNode = document.getElementById(`wa-${d.id}`);
      if (smsNode) { smsNode.textContent = '✅ SMS Delivered'; smsNode.style.color = 'var(--green)'; }
      if (waNode) { waNode.style.display = 'inline'; }
    }, 600 + i * 400);
  });
}

// ── Live Courier Transit Simulation Engine Vector ─────────────
function showTransitTracker(bankName = 'Red Cross Central Bank', eta = '12') {
  const transitSection = document.getElementById('transitSection');
  if (!transitSection) return;
  
  transitSection.style.display = 'block';

  document.getElementById('transitInfo').innerHTML = `
    <div class="transit-card" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; width:100%;">
      <div class="transit-item" style="border-right:1px solid var(--gray-100);"><span>📦 Supply Hub Source</span><strong>${bankName}</strong></div>
      <div class="transit-item" style="border-right:1px solid var(--gray-100);"><span>🏥 Target Destination</span><strong>Emergency Trauma Center</strong></div>
      <div class="transit-item" style="border-right:1px solid var(--gray-100);"><span>⏱ Driving Deadline</span><strong style="color:var(--red);">${eta} minutes remaining</strong></div>
      <div class="transit-item"><span>📍 Dispatch State</span><strong style="color:var(--blue);">IN TRANSIT 🚑</strong></div>
    </div>
  `;

  if (transitMapInstance) {
    transitMapInstance.remove();
    transitMapInstance = null;
  }

  const startPoint = [13.6288, 79.4192];
  const endPoint   = [13.6388, 79.4092];

  transitMapInstance = L.map('transitMap').setView([13.6338, 79.4142], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(transitMapInstance);

  L.marker(startPoint, { icon: L.divIcon({ html: '<span style="font-size:24px;">🏥</span>', className: '', iconSize: [30,30] }) }).addTo(transitMapInstance);
  L.marker(endPoint,   { icon: L.divIcon({ html: '<span style="font-size:24px;">🏦</span>', className: '', iconSize: [30,30] }) }).addTo(transitMapInstance);

  const vehicleIcon = L.divIcon({ html: '<span style="font-size:26px; display:inline-block; transition:all 0.1s linear;">🚑</span>', className: '', iconSize: [30,30] });
  const courierMarker = L.marker(startPoint, { icon: vehicleIcon }).addTo(transitMapInstance);
  L.polyline([startPoint, endPoint], { color: 'var(--blue)', weight: 4, opacity: 0.7 }).addTo(transitMapInstance);

  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    currentProgress += 0.02;
    if (currentProgress >= 1) { 
      clearInterval(progressInterval); 
      return; 
    }
    const deltaLat = startPoint[0] + (endPoint[0] - startPoint[0]) * currentProgress;
    const deltaLng = startPoint[1] + (endPoint[1] - startPoint[1]) * currentProgress;
    if (courierMarker) courierMarker.setLatLng([deltaLat, deltaLng]);
  }, 350);

  transitSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}