import { createClient } from "@supabase/supabase-js";
import { SupabaseConfig } from "../types";

// Dynamic Client Initialization
let supabaseInstance: any = null;

export function getSupabaseClient(config?: SupabaseConfig) {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check custom cached credentials
  const saved = localStorage.getItem("supabase_custom_config");
  let customConfig: SupabaseConfig | null = null;
  if (saved) {
    try {
      customConfig = JSON.parse(saved);
    } catch (_) {}
  }

  const url = config?.url || customConfig?.url || (import.meta as any).env.VITE_SUPABASE_URL;
  const anonKey = config?.anonKey || customConfig?.anonKey || (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (url && anonKey && url.startsWith("http")) {
    try {
      supabaseInstance = createClient(url, anonKey);
      return supabaseInstance;
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
    }
  }

  return null;
}

// Help create schemas in client local mock storage if Supabase is disconnected
export function getLocalMockUser() {
  const savedUser = localStorage.getItem("mock_session_userId");
  if (savedUser) return savedUser;
  const newId = `usr_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem("mock_session_userId", newId);
  return newId;
}
