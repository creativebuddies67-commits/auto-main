import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ✅ Use NEXT_PUBLIC_* env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! || 'https://rcvkgihgcwoatjbwpzgp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || 'sb_publishable_fsbPHD9AUn049iyx8PL6aw_Z6eVBKcn';
console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);


// ✅ Create client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // ✅ Only access localStorage in browser
      storage:
        typeof window !== "undefined" ? localStorage : undefined,
    },
  }
);
