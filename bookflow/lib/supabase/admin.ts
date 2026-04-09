import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Only use in Server Actions / Route Handlers.
// NEVER expose to the client.
export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
