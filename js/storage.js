/**
 * Storage and Registration Service Layer for NSU PODIUM 2026
 * Organizer: NSUDC — North South University Debate Club
 *
 * Backend: Supabase
 */

const SUPABASE_URL = "https://tgqftmluyhuxikeoaglp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_EfuSu4ppSHtigQPrXjB4vA_0aWelCj6";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const RATE_LIMIT_KEY = "podium_last_submission_time";
const RATE_LIMIT_MS = 4000; // 4 seconds throttle


class RegistrationService {

  constructor() {
    console.log("NSU PODIUM Registration Service initialized.");
  }


  /**
   * Generate official reference ID
   */
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


  /**
   * Prevent rapid repeated submissions
   */
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


  /**
   * Submit registration to Supabase
   */
  async submitRegistration(payload) {

    // Rate limit
    if (this.isRateLimited()) {
      throw new Error(
        "Please wait a few seconds before submitting another registration."
      );
    }


    // Clean input values
    const fullName = (payload.fullName || "").trim();
    const studentId = (payload.studentId || "").trim();
    const department = (payload.department || "").trim();
    const batch = (payload.batch || "").trim();
    const email = (payload.email || "").trim().toLowerCase();
    const phone = (payload.phone || "").trim();
    const eventPreference =
      (payload.eventPreference || "").trim();


    // Basic safety validation
    if (
      !fullName ||
      !studentId ||
      !department ||
      !batch ||
      !email ||
      !phone ||
      !eventPreference
    ) {
      throw new Error(
        "Please complete all required registration fields."
      );
    }


    // Generate reference ID
    const referenceId = this.generateReferenceId();


    /**
     * Object matching the Supabase table columns
     */
    const registrationData = {
      reference_id: referenceId,
      full_name: fullName,
      student_id: studentId,
      department: department,
      batch: batch,
      email: email,
      phone: phone,
      participation_category: eventPreference,
      status: "Confirmed"
    };


    try {

      /**
       * Insert registration into Supabase
       *
       * registration_date is automatically generated
       * by Supabase using the database default: now()
       */
      const { error } = await supabaseClient
        .from("registrations")
        .insert([registrationData]);


      if (error) {

        console.error(
          "Supabase registration error:",
          error
        );

        throw new Error(
          "Registration could not be submitted. Please try again."
        );
      }


      // Save submission time for rate limiting
      try {
        sessionStorage.setItem(
          RATE_LIMIT_KEY,
          Date.now().toString()
        );
      } catch (e) {
        // Ignore sessionStorage errors
      }


      /**
       * Return the same camelCase structure
       * expected by the existing app.js
       */
      return {
        referenceId: referenceId,
        fullName: fullName,
        studentId: studentId,
        department: department,
        batch: batch,
        email: email,
        phone: phone,
        eventPreference: eventPreference,
        status: "Confirmed",
        registrationDate: new Date().toISOString()
      };


    } catch (error) {

      console.error(
        "Registration submission failed:",
        error
      );

      throw error;
    }
  }
}


/**
 * Make registration service available
 * to the existing app.js
 */
window.registrationService =
  new RegistrationService();
