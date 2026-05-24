import { createClient } from "@supabase/supabase-js";

// Usa a service role key — NUNCA exposta ao cliente, só em Server Actions/Route Handlers
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
