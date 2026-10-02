/**
 * Supabase Client Configuration & Helper for NSU PODIUM 2026 (WEBSITE 1)
 * Organizer: NSUDC — North South University Debate Club
 * Target Table: public.bangla_registrations
 *
 * CRITICAL SECURITY GUIDELINE:
 * - Use ONLY your Supabase Project URL and Publishable / Anon Key here.
 * - NEVER use or expose your Supabase secret / service_role key in frontend code.
 */

function getStoredItem(key) {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch (_) {
    return null;
  }
}

const SUPABASE_CONFIG = {
  // Supabase Project URL
  url: (typeof window !== 'undefined' && window.SUPABASE_URL) || getStoredItem('PODIUM_SUPABASE_URL') || 'https://tgqftmluyhuxikeoaglp.supabase.co',

  // Supabase Publishable / Anon Key (public client key for project tgqftmluyhuxikeoaglp)
  anonKey: (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || getStoredItem('PODIUM_SUPABASE_ANON_KEY') || 'sb_publishable_EfuSu4ppSHtigQPrXjB4vA_0aWelCj6',

  // Database table name
  tableName: 'bangla_registrations'
};

// Check if valid credentials are provided
function isSupabaseConfigured() {
  const url = (typeof window !== 'undefined' && window.SUPABASE_URL) || SUPABASE_CONFIG.url || getStoredItem('PODIUM_SUPABASE_URL');
  const key = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || SUPABASE_CONFIG.anonKey || getStoredItem('PODIUM_SUPABASE_ANON_KEY');
  return (
    Boolean(url) &&
    !url.includes('YOUR_SUPABASE_PROJECT_URL') &&
    Boolean(key) &&
    key !== 'YOUR_SUPABASE_ANON_KEY' &&
    typeof key === 'string' &&
    key.trim().length > 0
  );
}

// Initialize Supabase Client instance using the official @supabase/supabase-js library
let _supabaseClientInstance = null;

function getSupabaseClient() {
  const url = (typeof window !== 'undefined' && window.SUPABASE_URL) || SUPABASE_CONFIG.url || getStoredItem('PODIUM_SUPABASE_URL');
  const key = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || SUPABASE_CONFIG.anonKey || getStoredItem('PODIUM_SUPABASE_ANON_KEY');

  if (_supabaseClientInstance && _supabaseClientInstance._podiumKey === key && _supabaseClientInstance._podiumUrl === url) {
    return _supabaseClientInstance;
  }

  // Check if supabase CDN script has loaded
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    if (isSupabaseConfigured()) {
      try {
        _supabaseClientInstance = window.supabase.createClient(url, key);
        _supabaseClientInstance._podiumKey = key;
        _supabaseClientInstance._podiumUrl = url;
        window.supabaseClient = _supabaseClientInstance;
        console.log('[Supabase] Initialized client successfully for:', url);
        console.log('[Supabase] Connected table: public.' + SUPABASE_CONFIG.tableName);
        return _supabaseClientInstance;
      } catch (err) {
        console.error('[Supabase] Error creating Supabase client:', err);
        return null;
      }
    }
  }

  return _supabaseClientInstance;
}

// Global exposure
if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.isSupabaseConfigured = isSupabaseConfigured;
  window.getSupabaseClient = getSupabaseClient;

  // Helper function to easily configure or update the publishable anon key at runtime
  window.setSupabaseAnonKey = function (key) {
    if (key && typeof key === 'string') {
      const cleanKey = key.trim();
      try {
        localStorage.setItem('PODIUM_SUPABASE_ANON_KEY', cleanKey);
      } catch (_) { }
      SUPABASE_CONFIG.anonKey = cleanKey;
      _supabaseClientInstance = null;
      const client = getSupabaseClient();
      console.log('[Supabase] Anon key configured. Client ready:', Boolean(client));
      return client;
    }
  };

  // Attempt initial client instantiation if credentials already exist
  getSupabaseClient();
}
