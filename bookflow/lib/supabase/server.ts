import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Reads the Supabase session from cookies (server components only)
export async function getServerUser(): Promise<{ id: string; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value
      ?? cookieStore.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`)?.value;

    if (!accessToken) return null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return null;

    return { id: user.id, email: user.email ?? "" };
  } catch {
    return null;
  }
}
