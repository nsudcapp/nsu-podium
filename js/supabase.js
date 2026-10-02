```js
/**
 * NSU PODIUM 2026
 * Supabase Client
 * Organizer: NSUDC
 */

const SUPABASE_URL = "https://tgqftmluyhuxikeoaglp.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_EfuSu4ppSHtigQPrXjB4vA_0aWelCj6";

let supabaseClient = null;

function getSupabaseClient() {

  if (supabaseClient) {
    return supabaseClient;
  }

  if (
    typeof window.supabase === "undefined" ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.error("[Supabase] Supabase JS library is not loaded.");
    return null;
  }

  try {

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    console.log(
      "[Supabase] Client initialized:",
      SUPABASE_URL
    );

    return supabaseClient;

  } catch (error) {

    console.error(
      "[Supabase] Client initialization failed:",
      error
    );

    return null;
  }
}

window.getSupabaseClient = getSupabaseClient;

window.SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  tableName: "bangla_registrations"
};

getSupabaseClient();
```
