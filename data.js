// ============================================================
// js/data.js — Shared Core Data Layers for RaktSetu Grid
// Shared static registries representing micro-state snapshots
// ============================================================

const BLOOD_BANKS = [
  {
    id: 1, 
    name: "Red Cross Central Bank", 
    city: "Tirupati",
    lat: 13.6288, 
    lng: 79.4192,
    stock: { "A+": 12, "A-": 3, "B+": 8, "B-": 1, "AB+": 5, "AB-": 0, "O+": 14, "O-": 2 },
    phone: "0877-2244556", 
    email: "redcross.tirupati@blood.in",
    lastUpdated: "2 min ago"
  },
  {
    id: 2, 
    name: "Apollo Blood Centre", 
    city: "Tirupati",
    lat: 13.6388, 
    lng: 79.4092,
    stock: { "A+": 6, "A-": 0, "B+": 11, "B-": 4, "AB+": 2, "AB-": 1, "O+": 9, "O-": 0 },
    phone: "0877-2287700", 
    email: "blood@apollo.tirupati.in",
    lastUpdated: "5 min ago"
  },
  {
    id: 3, 
    name: "SVIMS Blood Bank", 
    city: "Tirupati",
    lat: 13.6188, 
    lng: 79.4292,
    stock: { "A+": 0, "A-": 0, "B+": 3, "B-": 0, "AB+": 0, "AB-": 0, "O+": 2, "O-": 0 },
    phone: "0877-2287600", 
    email: "svims@blood.ap.gov.in",
    lastUpdated: "1 min ago"
  },
  {
    id: 4, 
    name: "Govt. General Hospital Bank", 
    city: "Chennai",
    lat: 13.0827, 
    lng: 80.2707,
    stock: { "A+": 20, "A-": 7, "B+": 15, "B-": 5, "AB+": 9, "AB-": 3, "O+": 22, "O-": 6 },
    phone: "044-25305000", 
    email: "ggh@blood.tn.gov.in",
    lastUpdated: "3 min ago"
  },
  {
    id: 5, 
    name: "AIIMS Blood Services", 
    city: "Delhi",
    lat: 28.5672, 
    lng: 77.2100,
    stock: { "A+": 18, "A-": 5, "B+": 13, "B-": 3, "AB+": 7, "AB-": 2, "O+": 19, "O-": 4 },
    phone: "011-26588500", 
    email: "blood@aiims.edu",
    lastUpdated: "4 min ago"
  },
  {
    id: 6, 
    name: "KEM Hospital Blood Bank", 
    city: "Mumbai",
    lat: 19.0022, 
    lng: 72.8414,
    stock: { "A+": 9, "A-": 2, "B+": 7, "B-": 1, "AB+": 3, "AB-": 0, "O+": 11, "O-": 1 },
    phone: "022-24107000", 
    email: "blood@kem.mhmc.in",
    lastUpdated: "6 min ago"
  },
  {
    id: 7, 
    name: "Nimhans Blood Bank", 
    city: "Bengaluru",
    lat: 12.9432, 
    lng: 77.5974,
    stock: { "A+": 4, "A-": 0, "B+": 6, "B-": 0, "AB+": 1, "AB-": 0, "O+": 5, "O-": 0 },
    phone: "080-46110007", 
    email: "blood@nimhans.ac.in",
    lastUpdated: "8 min ago"
  },
  {
    id: 8, 
    name: "Osmania Hospital Bank", 
    city: "Hyderabad",
    lat: 17.3850, 
    lng: 78.4867,
    stock: { "A+": 16, "A-": 4, "B+": 10, "B-": 2, "AB+": 6, "AB-": 1, "O+": 18, "O-": 3 },
    phone: "040-24600199", 
    email: "blood@osmania.ts.gov.in",
    lastUpdated: "2 min ago"
  }
];

const DONORS = [
  { id: 1, name: "Arjun Reddy", bloodGroup: "O-", city: "Tirupati", lat: 13.6300, lng: 79.4150, phone: "+91-9876543210", lastDonated: "2025-10-01", available: true },
  { id: 2, name: "Priya Sharma", bloodGroup: "A+", city: "Tirupati", lat: 13.6250, lng: 79.4220, phone: "+91-9876543211", lastDonated: "2026-03-15", available: true },
  { id: 3, name: "Ravi Kumar", bloodGroup: "B+", city: "Tirupati", lat: 13.6310, lng: 79.4100, phone: "+91-9876543212", lastDonated: "2026-06-10", available: false },
  { id: 4, name: "Meena Iyer", bloodGroup: "AB+", city: "Chennai", lat: 13.0900, lng: 80.2750, phone: "+91-9876543213", lastDonated: "2025-12-20", available: true },
  { id: 5, name: "Suresh Babu", bloodGroup: "O+", city: "Tirupati", lat: 13.6200, lng: 79.4300, phone: "+91-9876543214", lastDonated: "2025-09-05", available: true },
  { id: 6, name: "Kavitha Nair", bloodGroup: "A-", city: "Tirupati", lat: 13.6350, lng: 79.4180, phone: "+91-9876543215", lastDonated: "2026-04-01", available: true },
  { id: 7, name: "Vikram Singh", bloodGroup: "B-", city: "Delhi", lat: 28.5700, lng: 77.2150, phone: "+91-9876543216", lastDonated: "2025-11-11", available: true },
  { id: 8, name: "Ananya Das", bloodGroup: "O-", city: "Mumbai", lat: 19.0100, lng: 72.8500, phone: "+91-9876543217", lastDonated: "2026-01-22", available: true },
];

const EMERGENCY_REQUESTS = [
  {
    id: "REQ-2026-8804", 
    bloodGroup: "O-", 
    units: 3,
    hospital: "Apollo Trauma Center, Tirupati",
    status: "IN_TRANSIT", 
    assignedBank: "Red Cross Central Bank",
    etaMinutes: 14, 
    distanceKm: 6.8,
    donorsPinged: 12, 
    donorsResponded: 2,
    timestamp: "2026-06-25T16:24:00Z"
  },
  {
    id: "REQ-2026-8799", 
    bloodGroup: "B-", 
    units: 2,
    hospital: "SVIMS Hospital, Tirupati",
    status: "SEARCHING", 
    assignedBank: null,
    etaMinutes: null, 
    distanceKm: null,
    donorsPinged: 8, 
    donorsResponded: 0,
    timestamp: "2026-06-25T16:10:00Z"
  },
  {
    id: "REQ-2026-8790", 
    bloodGroup: "A+", 
    units: 5,
    hospital: "Ruia Hospital, Mumbai",
    status: "FULFILLED", 
    assignedBank: "KEM Hospital Blood Bank",
    etaMinutes: 22, 
    distanceKm: 11.2,
    donorsPinged: 5, 
    donorsResponded: 3,
    timestamp: "2026-06-25T15:45:00Z"
  }
];

// ── Shared Helper Functions ──────────────────────────────────

/**
 * Returns scarcity rating criteria flag based on metric density
 * @param {Object} stock - The stock object for a blood bank
 * @returns {string} - "critical" | "low" | "available"
 */
function getBankStatus(stock) {
  const vals = Object.values(stock);
  const total = vals.reduce((a, b) => a + b, 0);
  const zeros = vals.filter(v => v === 0).length;
  
  if (zeros >= 5 || total < 5) return "critical";
  if (total < 30) return "low";
  return "available";
}

/**
 * Calculates date diff differences relative to current runtime logs
 * @param {string} dateStr - YYYY-MM-DD format
 * @returns {number} - Floor count of day intervals
 */
function daysSince(dateStr) {
  const then = new Date(dateStr);
  const now = new Date();
  const diffTime = now - then;
  // Guard clause against negative timelines (future inputs)
  if (diffTime < 0) return 0;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validates tracking eligibility thresholds (90-day guard rails)
 * @param {Object} donor - Single donor object model
 * @returns {boolean}
 */
function isDonorEligible(donor) {
  if (!donor.available) return false;
  return daysSince(donor.lastDonated) >= 90;
}