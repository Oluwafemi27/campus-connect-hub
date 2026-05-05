import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[Supabase] URL configured:", !!supabaseUrl);
console.log("[Supabase] Key configured:", !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "FATAL: Missing Supabase environment variables! VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined.",
  );
  console.error("[Supabase] URL value:", supabaseUrl);
  console.error("[Supabase] Key value:", supabaseAnonKey);
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
);

console.log("[Supabase] Client initialized with URL:", supabaseUrl);

// Test connection on initialization
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder")) {
  (async () => {
    try {
      console.log("[Supabase] Testing connection...");
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("[Supabase] Connection test failed:", error);
      } else {
        console.log("[Supabase] Connection test successful");
      }
    } catch (err) {
      console.error("[Supabase] Connection test error:", err);
    }
  })();
}

export type Database = Record<string, unknown>;
