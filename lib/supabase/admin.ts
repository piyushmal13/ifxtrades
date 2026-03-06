import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === "dummykey") {
    throw new Error(
      "[IFX] SUPABASE_SERVICE_ROLE_KEY is not set or is using the placeholder value. " +
      "Go to Supabase → Settings → API and paste the real service_role key into your Vercel environment variables.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
