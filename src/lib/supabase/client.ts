import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Missing Supabase environment variables. NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${supabaseKey ? 'set' : 'not set'}`
  );
}

export function createClient() {
  return createBrowserClient<Database, "undangan">(supabaseUrl, supabaseKey, {
    db: { schema: "undangan" },
    global: {
      headers: {
        "Content-Profile": "undangan",
        "Accept-Profile": "undangan",
      },
    },
  });
}