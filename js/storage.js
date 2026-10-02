/**
 * Storage and Registration Service Layer for NSU PODIUM 2026
 * Organizer: NSUDC — North South University Debate Club
 *
 * Handles team registration with local persistence,
 * duplicate protection, and anti-spam rate limiting.
 */

const STORAGE_KEY = 'nsu_podium_team_registrations_2026';
const RATE_LIMIT_KEY = 'podium_team_last_submission_time';
const RATE_LIMIT_MS = 2000; // 2 seconds throttle

const DEFAULT_SEEDS = [
  {
    referenceId: "PODIUM-2026-A82F1",
    institutionClubName: "North South University / NSUDC",
    representativeName: "Tanvir Ahmed",
    contactNo: "+880 1712-345678",
    email: "representative@nsudc.org",
    slots: "2",
    status: "Confirmed",
    registrationDate: new Date("2026-09-20T10:30:00Z").toISOString()
  }
];

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
      console.warn("Storage notice: LocalStorage restricted. Using in-memory store.", e);
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

  checkDuplicate(contactNo, email) {
    const all = this.getRegistrations();
    const cleanPhone = (contactNo || '').replace(/[\s\-\(\)]/g, '');
    const cleanEmail = (email || '').trim().toLowerCase();

    return all.find(item => {
      const itemPhone = (item.contactNo || '').replace(/[\s\-\(\)]/g, '');
      const itemEmail = (item.email || '').trim().toLowerCase();

      return (cleanPhone && itemPhone && itemPhone === cleanPhone) ||
             (cleanEmail && itemEmail && itemEmail === cleanEmail);
    });
  }

  async submitRegistration(payload) {
    if (this.isRateLimited()) {
      throw new Error("Please wait a moment before submitting another registration.");
    }

    // Realistic UI processing latency
    await new Promise(resolve => setTimeout(resolve, 250));

    // Client-side Duplicate check
    const duplicate = this.checkDuplicate(
      payload.contactNo,
      payload.email
    );

    if (duplicate) {
      throw new Error(
        `A registration already exists with this Contact No (${duplicate.contactNo}) or Email (${duplicate.email}). Existing Reference ID: ${duplicate.referenceId}`
      );
    }

    // 1. Generate unique reference ID in required format: PODIUM-2026-XXXXX
    const refId = this.generateReferenceId();
    const currentDate = new Date().toISOString();
    const parsedSlots = parseInt(payload.slots, 10);
    const slotsCount = isNaN(parsedSlots) ? 1 : parsedSlots;

    // 2. Prepare payload formatted EXACTLY for public.bangla_registrations
    const supabaseRecord = {
      reference_id: refId,
      institution_club_name: (payload.institutionClubName || '').trim(),
      representative_name: (payload.representativeName || '').trim(),
      contact_no: (payload.contactNo || '').trim(),
      email: (payload.email || '').trim().toLowerCase(),
      number_of_slots: slotsCount,
      status: "Confirmed",
      registration_date: currentDate
    };

    // 3. Insert into Supabase table public.bangla_registrations
    const supabase = (typeof window.getSupabaseClient === 'function' && window.getSupabaseClient()) || window.supabaseClient;

    if (supabase) {
      console.log('[Supabase] Inserting registration into public.bangla_registrations...', supabaseRecord);
      const { data, error } = await supabase
        .from('bangla_registrations')
        .insert([supabaseRecord]);

      if (error) {
        console.error('[Supabase Insert Error]:', error);
        if (error.code === '23505') {
          throw new Error('A team registration with this Contact No or Email already exists in Supabase.');
        }
        throw new Error(`Supabase registration error: ${error.message || 'Failed to save to database.'}`);
      }

      console.log('[Supabase] Successfully saved to public.bangla_registrations:', supabaseRecord);
    } else {
      console.warn(
        '[Supabase Notice] Supabase credentials not set or using placeholders. ' +
        'Update js/supabase.js with your project URL and publishable anon key to write to Supabase directly.'
      );
    }

    // 4. Persistence for receipt UI and local backup
    const newRecord = {
      referenceId: refId,
      institutionClubName: supabaseRecord.institution_club_name,
      representativeName: supabaseRecord.representative_name,
      contactNo: supabaseRecord.contact_no,
      email: supabaseRecord.email,
      slots: String(supabaseRecord.number_of_slots),
      status: supabaseRecord.status,
      registrationDate: supabaseRecord.registration_date
    };

    const current = this.getRegistrations();
    current.unshift(newRecord);
    this.saveRegistrations(current);

    sessionStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
    return newRecord;
  }
}

window.registrationService = new RegistrationService();
