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
  const { data, error } = await supabase.auth.signUp({
    email: "admin@undangan.sch.id",
    password: "1123581321",
  });

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  console.log("Admin user created:", data.user);
}

createAdmin();