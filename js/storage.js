/**
 * Storage and API Service Layer
 * Supports local client persistence (localStorage) and seamless backend fallback.
 * Built for scalability: ready for multi-event handling, duplicate checks, and status tracking.
 */

const STORAGE_KEY = 'nsu_podium_registrations';
const RATE_LIMIT_KEY = 'podium_reg_last_submission_timestamp';
const RATE_LIMIT_WINDOW_MS = 5000; // 5 seconds anti-spam throttle

// Seed initial institutional registrations for realistic lookup and demonstration
const DEFAULT_SEED_DATA = [
  {
    referenceId: "PODIUM-A82F1",
    institutionName: "University of Dhaka",
    clubName: "Dhaka University Debating Society (DUDS)",
    slots: 6,
    representativeName: "Tanvir Ahmed",
    representativePhone: "+8801712345678",
    status: "Confirmed",
    registrationDate: "2026-09-20T10:30:00Z"
  },
  {
    referenceId: "PODIUM-B94K3",
    institutionName: "Bangladesh University of Engineering and Technology (BUET)",
    clubName: "BUET Debating Club",
    slots: 8,
    representativeName: "Nusrat Jahan",
    representativePhone: "+8801819876543",
    status: "Confirmed",
    registrationDate: "2026-09-22T14:15:00Z"
  }
];

class RegistrationService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEED_DATA));
      }
    } catch (e) {
      console.warn("Local storage not accessible, falling back to memory.", e);
      this.memoryStore = [...DEFAULT_SEED_DATA];
    }
  }

  getRegistrations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : (this.memoryStore || []);
    } catch (e) {
      return this.memoryStore || [];
    }
  }

  saveRegistrations(registrations) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    } catch (e) {
      this.memoryStore = registrations;
    }
  }

  /**
   * Generates an official reference ID formatted as: PODIUM-XXXXX
   */
  generateReferenceId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded ambiguous chars like O, 0, 1, I
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PODIUM-${randomPart}`;
  }

  /**
   * Rate limiting verification to stop rapid repeated automated spam
   */
  isRateLimited() {
    const lastTime = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!lastTime) return false;
    const diff = Date.now() - parseInt(lastTime, 10);
    return diff < RATE_LIMIT_WINDOW_MS;
  }

  /**
   * Check for duplicate submissions by Institution + Club or Phone Number
   */
  checkDuplicate(institutionName, clubName, representativePhone) {
    const registrations = this.getRegistrations();
    const cleanInst = institutionName.trim().toLowerCase();
    const cleanClub = clubName.trim().toLowerCase();
    const cleanPhone = representativePhone.replace(/[\s\-\(\)]/g, '');

    return registrations.find(item => {
      const itemInst = item.institutionName.trim().toLowerCase();
      const itemClub = item.clubName.trim().toLowerCase();
      const itemPhone = item.representativePhone.replace(/[\s\-\(\)]/g, '');

      return (itemInst === cleanInst && itemClub === cleanClub) || (itemPhone === cleanPhone);
    });
  }

  /**
   * Submits a new registration
   * Returns a promise simulating realistic API behavior with validation & sanitization
   */
  async submitRegistration(payload) {
    // 1. Rate-limit check
    if (this.isRateLimited()) {
      throw new Error("Please wait a few seconds before submitting another registration.");
    }

    // 2. Simulate network latency (250ms - 450ms)
    await new Promise(resolve => setTimeout(resolve, 350));

    // 3. Duplicate check
    const duplicate = this.checkDuplicate(
      payload.institutionName,
      payload.clubName,
      payload.representativePhone
    );

    if (duplicate) {
      throw new Error(
        `A registration already exists for ${duplicate.institutionName} (${duplicate.clubName}) with reference ID: ${duplicate.referenceId}.`
      );
    }

    // 4. Sanitize and structure registration record
    const refId = this.generateReferenceId();
    const record = {
      referenceId: refId,
      institutionName: payload.institutionName.trim(),
      clubName: payload.clubName.trim(),
      slots: parseInt(payload.slots, 10),
      representativeName: payload.representativeName.trim(),
      representativePhone: payload.representativePhone.trim(),
      status: "Confirmed",
      registrationDate: new Date().toISOString()
    };

    // 5. Store record
    const all = this.getRegistrations();
    all.unshift(record);
    this.saveRegistrations(all);

    // Update rate limit timestamp
    sessionStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

    return record;
  }

  /**
   * Lookup registration by Reference ID or Contact Phone
   */
  lookupRegistration(query) {
    if (!query) return null;
    const cleanQuery = query.trim().toUpperCase();
    const cleanPhone = query.trim().replace(/[\s\-\(\)]/g, '');
    const all = this.getRegistrations();

    return all.find(item => {
      const itemRef = item.referenceId.toUpperCase();
      const itemPhone = item.representativePhone.replace(/[\s\-\(\)]/g, '');
      return itemRef === cleanQuery || itemPhone.includes(cleanPhone);
    });
  }

  /**
   * Calculate remaining slots (Total capacity: 350)
   */
  getSlotStats() {
    const all = this.getRegistrations();
    const allocated = all.reduce((sum, item) => sum + (item.slots || 0), 0);
    const totalCapacity = 350;
    const remaining = Math.max(0, totalCapacity - allocated);
    return {
      total: totalCapacity,
      allocated: allocated,
      remaining: remaining,
      totalClubs: all.length
    };
  }
}

// Export singleton instance
window.registrationService = new RegistrationService();
