import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database, "undangan">(supabaseUrl, supabaseKey, {
    db: { schema: "undangan" },
    global: {
      headers: {
        "Content-Profile": "undangan",
        "Accept-Profile": "undangan",
      },
    },
  });
}