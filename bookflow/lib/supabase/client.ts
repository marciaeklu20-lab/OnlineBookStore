import { createBrowserClient } from "@supabase/ssr";

// Browser client — stores session in cookies so server components can read it
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Named export so components can call createClient() and get the singleton
export function createClient() {
  return supabase;
}
