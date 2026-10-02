/**
 * Storage and Registration Service Layer for NSU PODIUM 2026
 * Organizer: NSUDC — North South University Debate Club
 *
 * Handles team registration with Supabase backend,
 * local persistence, duplicate protection, and rate limiting.
 */

const STORAGE_KEY = "nsu_podium_team_registrations_2026";
const RATE_LIMIT_KEY = "podium_team_last_submission_time";
const RATE_LIMIT_MS = 4000;

class RegistrationService {

  constructor() {
    this.memoryStore = [];

    console.log("NSU PODIUM Registration Service initialized.");

    this.initStorage();
  }

  initStorage() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);

      if (!existing) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([])
        );
      }
    } catch (e) {
      console.warn(
        "Storage notice: LocalStorage restricted. Using in-memory store.",
        e
      );
    }
  }

  getRegistrations() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);

      return data
        ? JSON.parse(data)
        : this.memoryStore;
    } catch (e) {
      return this.memoryStore;
    }
  }

  saveRegistrations(list) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(list)
      );
    } catch (e) {
      this.memoryStore = list;
    }
  }

  generateReferenceId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 5; i++) {
      code += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    return `PODIUM-2026-${code}`;
  }

  isRateLimited() {
    try {
      const last = sessionStorage.getItem(RATE_LIMIT_KEY);

      if (!last) {
        return false;
      }

      return (
        Date.now() - parseInt(last, 10) < RATE_LIMIT_MS
      );
    } catch (e) {
      return false;
    }
  }

  normalizePhone(phone) {
    return (phone || "")
      .replace(/[\s-\(\)]/g, "")
      .trim();
  }

  normalizeEmail(email) {
    return (email || "")
      .trim()
      .toLowerCase();
  }

  checkDuplicate(contactNo, email) {
    const all = this.getRegistrations();

    const cleanPhone = this.normalizePhone(contactNo);
    const cleanEmail = this.normalizeEmail(email);

    return all.find(item => {
      const itemPhone = this.normalizePhone(item.contactNo);
      const itemEmail = this.normalizeEmail(item.email);

      return (
        (
          cleanPhone &&
          itemPhone &&
          itemPhone === cleanPhone
        ) ||
        (
          cleanEmail &&
          itemEmail &&
          itemEmail === cleanEmail
        )
      );
    });
  }

  async submitRegistration(payload) {

    if (this.isRateLimited()) {
      throw new Error(
        "Please wait a few seconds before submitting another registration."
      );
    }

    const institutionClubName =
      (payload.institutionClubName || "").trim();

    const representativeName =
      (payload.representativeName || "").trim();

    const contactNo =
      (payload.contactNo || "").trim();

    const email =
      this.normalizeEmail(payload.email);

    const slots =
      (payload.slots || "").toString().trim();

    if (
      !institutionClubName ||
      !representativeName ||
      !contactNo ||
      !email ||
      !slots
    ) {
      throw new Error(
        "Please complete all required registration fields."
      );
    }

    const duplicate = this.checkDuplicate(
      contactNo,
      email
    );

    if (duplicate) {
      throw new Error(
        "A registration with this Contact No or Email already exists."
      );
    }

    const parsedSlots = parseInt(slots, 10);

    const slotsCount = isNaN(parsedSlots)
      ? 1
      : parsedSlots;

    const referenceId =
      this.generateReferenceId();

    const registrationDate =
      new Date().toISOString();

    const supabaseRecord = {
      reference_id: referenceId,
      institution_club_name: institutionClubName,
      representative_name: representativeName,
      contact_no: contactNo,
      email: email,
      number_of_slots: slotsCount,
      status: "Confirmed",
      registration_date: registrationDate
    };

    const supabase =
      typeof window.getSupabaseClient === "function"
        ? window.getSupabaseClient()
        : window.supabaseClient;

    if (!supabase) {
      console.error(
        "[Supabase] Client not available."
      );

      throw new Error(
        "Registration service is not connected to the database. Please try again."
      );
    }

    try {

      console.log(
        "[Supabase] Submitting registration:",
        supabaseRecord
      );

      const {
        data,
        error
      } = await supabase
        .from("bangla_registrations")
        .insert([supabaseRecord])
        .select()
        .single();

      if (error) {

        console.error(
          "[Supabase Insert Error]:",
          error
        );

        if (error.code === "23505") {
          throw new Error(
            "A registration with this Contact No or Email already exists."
          );
        }

        throw new Error(
          error.message ||
          "Registration could not be submitted. Please try again."
        );
      }

      console.log(
        "[Supabase] Registration saved successfully:",
        data
      );

      try {
        sessionStorage.setItem(
          RATE_LIMIT_KEY,
          Date.now().toString()
        );
      } catch (e) {
        // Ignore sessionStorage errors
      }

      const newRecord = {
        referenceId: referenceId,
        institutionClubName: institutionClubName,
        representativeName: representativeName,
        contactNo: contactNo,
        email: email,
        slots: String(slotsCount),
        status: "Confirmed",
        registrationDate: registrationDate
      };

      const registrations =
        this.getRegistrations();

      registrations.push(newRecord);

      this.saveRegistrations(
        registrations
      );

      return newRecord;

    } catch (error) {

      console.error(
        "[Registration Service] Submission failed:",
        error
      );

      throw error;
    }
  }
}

window.registrationService =
  new RegistrationService();