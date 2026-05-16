import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@undangan.sch.id";
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || "1123581321";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  console.log("Admin user created:", data.user?.id);
}

createAdmin();