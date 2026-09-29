/**
 * Storage and Registration Service Layer for NSU PODIUM 2026
 * Organizer: NSUDC — North South University Debate Club
 */

const STORAGE_KEY = 'nsu_podium_registrations_2026';
const RATE_LIMIT_KEY = 'podium_last_submission_time';
const RATE_LIMIT_MS = 4000; // 4 seconds throttle

const DEFAULT_SEEDS = [];

class RegistrationService {
  constructor() {
    this.memoryStore = [...DEFAULT_SEEDS];
    this.initStorage();
  }

  initStorage() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEEDS));
      }
    } catch (e) {
      console.warn("Storage warning: LocalStorage restricted. Using memory store.", e);
    }
  }

  getRegistrations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : this.memoryStore;
    } catch (e) {
      return this.memoryStore;
    }
  }

  saveRegistrations(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      this.memoryStore = list;
    }
  }

  generateReferenceId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PODIUM-2026-${code}`;
  }

  isRateLimited() {
    const last = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!last) return false;
    return Date.now() - parseInt(last, 10) < RATE_LIMIT_MS;
  }

  checkDuplicate(studentId, email, phone) {
    const all = this.getRegistrations();
    const cleanId = studentId.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    return all.find(item => {
      const idMatch = item.studentId && item.studentId.trim().toLowerCase() === cleanId;
      const emailMatch = item.email && item.email.trim().toLowerCase() === cleanEmail;
      const phoneMatch = item.phone && item.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone;
      return idMatch || emailMatch || phoneMatch;
    });
  }

  async submitRegistration(payload) {
    if (this.isRateLimited()) {
      throw new Error("Please wait a few seconds before submitting another registration.");
    }

    // Realistic processing latency
    await new Promise(resolve => setTimeout(resolve, 400));

    // Duplicate verification
    const duplicate = this.checkDuplicate(payload.studentId, payload.email, payload.phone);
    if (duplicate) {
      throw new Error(
        `A registration already exists with Student ID (${duplicate.studentId}) or Email (${duplicate.email}). Reference ID: ${duplicate.referenceId}.`
      );
    }

    const newRecord = {
      referenceId: this.generateReferenceId(),
      fullName: payload.fullName.trim(),
      studentId: payload.studentId.trim(),
      department: payload.department.trim(),
      batch: payload.batch.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      eventPreference: payload.eventPreference.trim(),
      status: "Confirmed",
      registrationDate: new Date().toISOString()
    };

    const current = this.getRegistrations();
    current.unshift(newRecord);
    this.saveRegistrations(current);

    sessionStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    return newRecord;
  }
}

window.registrationService = new RegistrationService();
