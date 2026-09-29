/**
 * Production-ready Express API Server
 * National Collegiate Innovation & Leadership Summit (NCILS 2026)
 *
 * Implements:
 * - Server-side validation & sanitization
 * - Rate limiting & brute-force defense
 * - Duplicate submission prevention
 * - Reference ID generation
 * - Extensible REST endpoints for future Admin, QR Check-in, & Search
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const EVENT_CAPACITY = parseInt(process.env.EVENT_CAPACITY, 10) || 350;

// Middleware
app.use(express.json({ limit: '10kb' })); // Mitigate body flood attacks
app.use(express.urlencoded({ extended: false }));

// Security Response Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Simple in-memory rate limiter per IP
const requestLog = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // Max requests per window

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const userHistory = requestLog.get(ip) || [];

  const recent = userHistory.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  if (recent.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a minute before trying again.'
    });
  }

  recent.push(now);
  requestLog.set(ip, recent);
  next();
};

// In-Memory Database Store (Extensible to PostgreSQL / MongoDB / SQLite)
const registrations = [
  {
    referenceId: "PODIUM-A82F1",
    institutionName: "University of Dhaka",
    clubName: "Dhaka University Debating Society (DUDS)",
    slots: 6,
    representativeName: "Tanvir Ahmed",
    representativePhone: "+8801712345678",
    status: "Confirmed",
    checkedIn: false,
    registrationDate: new Date("2026-09-20T10:30:00Z").toISOString()
  },
  {
    referenceId: "PODIUM-B94K3",
    institutionName: "Bangladesh University of Engineering and Technology (BUET)",
    clubName: "BUET Debating Club",
    slots: 8,
    representativeName: "Nusrat Jahan",
    representativePhone: "+8801819876543",
    status: "Confirmed",
    checkedIn: false,
    registrationDate: new Date("2026-09-22T14:15:00Z").toISOString()
  }
];

// Reference ID generator
function generateReferenceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PODIUM-${randomPart}`;
}

// Input sanitizer
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim();
}

// Bangladeshi & International Phone Validator
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  const bdRegex = /^(?:\+?880|880|0)?(1[3-9]\d{8})$/;
  const genericInternationalRegex = /^\+?[0-9]{8,15}$/;
  return bdRegex.test(clean) || genericInternationalRegex.test(clean);
}

// =========================================================================
// API ROUTES
// =========================================================================

// 1. Submit Registration
app.post('/api/register', rateLimiter, (req, res) => {
  const {
    institutionName,
    clubName,
    slots,
    representativeName,
    representativePhone
  } = req.body;

  // Server-side validation
  const errors = {};

  const cleanInst = sanitizeInput(institutionName);
  const cleanClub = sanitizeInput(clubName);
  const cleanRep = sanitizeInput(representativeName);
  const cleanPhone = sanitizeInput(representativePhone);
  const parsedSlots = parseInt(slots, 10);

  if (!cleanInst || cleanInst.length < 3) {
    errors.institutionName = 'Institution name is required and must be at least 3 characters.';
  }
  if (!cleanClub || cleanClub.length < 2) {
    errors.clubName = 'Club name is required and must be at least 2 characters.';
  }
  if (isNaN(parsedSlots) || parsedSlots < 1 || parsedSlots > 25) {
    errors.slots = 'Number of slots must be an integer between 1 and 25.';
  }
  if (!cleanRep || cleanRep.length < 3) {
    errors.representativeName = 'Representative name is required and must be at least 3 characters.';
  }
  if (!isValidPhone(cleanPhone)) {
    errors.representativePhone = 'A valid Bangladeshi or international contact number is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed on submitted fields.',
      errors
    });
  }

  // Duplicate Submission Check
  const duplicate = registrations.find(r => {
    const isSameClub = r.institutionName.toLowerCase() === cleanInst.toLowerCase() &&
                       r.clubName.toLowerCase() === cleanClub.toLowerCase();
    const isSamePhone = r.representativePhone.replace(/[\s\-\(\)]/g, '') === cleanPhone.replace(/[\s\-\(\)]/g, '');
    return isSameClub || isSamePhone;
  });

  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: `A registration already exists for ${duplicate.institutionName} (${duplicate.clubName}) with reference ID: ${duplicate.referenceId}.`
    });
  }

  // Check Remaining Capacity
  const allocated = registrations.reduce((sum, item) => sum + (item.slots || 0), 0);
  if (allocated + parsedSlots > EVENT_CAPACITY) {
    return res.status(400).json({
      success: false,
      message: `Only ${Math.max(0, EVENT_CAPACITY - allocated)} slots remain available. Please adjust your delegation size.`
    });
  }

  // Create Registration Record
  const newRegistration = {
    referenceId: generateReferenceId(),
    institutionName: cleanInst,
    clubName: cleanClub,
    slots: parsedSlots,
    representativeName: cleanRep,
    representativePhone: cleanPhone,
    status: 'Confirmed',
    checkedIn: false,
    registrationDate: new Date().toISOString()
  };

  registrations.unshift(newRegistration);

  return res.status(201).json({
    success: true,
    message: 'Institutional registration submitted successfully.',
    data: newRegistration
  });
});

// 2. Lookup Registration by Ref ID or Phone
app.get('/api/registration/:query', rateLimiter, (req, res) => {
  const query = req.params.query.trim().toUpperCase();
  const cleanPhone = query.replace(/[\s\-\(\)]/g, '');

  const match = registrations.find(r =>
    r.referenceId.toUpperCase() === query ||
    r.representativePhone.replace(/[\s\-\(\)]/g, '').includes(cleanPhone)
  );

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'No registration found matching the provided criteria.'
    });
  }

  return res.json({
    success: true,
    data: match
  });
});

// 3. Overall Statistics & Capacity
app.get('/api/stats', (req, res) => {
  const allocated = registrations.reduce((sum, item) => sum + (item.slots || 0), 0);
  res.json({
    success: true,
    totalCapacity: EVENT_CAPACITY,
    allocatedSlots: allocated,
    remainingSlots: Math.max(0, EVENT_CAPACITY - allocated),
    totalRegistrations: registrations.length
  });
});

// 4. Admin / Management List (with optional API key authorization)
app.get('/api/registrations', (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY || 'demo-admin-key';

  if (adminKey !== expectedKey && process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid Admin API Key.'
    });
  }

  const { search, status, limit = 50, page = 1 } = req.query;
  let results = [...registrations];

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(r =>
      r.institutionName.toLowerCase().includes(s) ||
      r.clubName.toLowerCase().includes(s) ||
      r.representativeName.toLowerCase().includes(s) ||
      r.referenceId.toLowerCase().includes(s)
    );
  }

  if (status) {
    results = results.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    success: true,
    total: results.length,
    page: parseInt(page, 10),
    data: results.slice((page - 1) * limit, page * limit)
  });
});

// 5. QR Check-in Endpoint (Scalability Feature)
app.post('/api/registration/:refId/check-in', (req, res) => {
  const refId = req.params.refId.toUpperCase();
  const registration = registrations.find(r => r.referenceId.toUpperCase() === refId);

  if (!registration) {
    return res.status(404).json({ success: false, message: 'Invalid Reference ID.' });
  }

  if (registration.checkedIn) {
    return res.status(400).json({
      success: false,
      message: `Already checked in at ${registration.checkedInAt}`
    });
  }

  registration.checkedIn = true;
  registration.checkedInAt = new Date().toISOString();

  res.json({
    success: true,
    message: `Delegation ${registration.clubName} successfully checked in.`,
    data: registration
  });
});

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname)));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`NCILS 2026 Summit Platform running on http://localhost:${PORT}`);
  });
}

module.exports = app;
