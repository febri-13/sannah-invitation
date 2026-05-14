import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Allowed setting keys that can be modified via API
const ALLOWED_KEYS = ["wa_template_invitation"];

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Get 'key' query param to filter single setting, or return all
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const { data, error } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("key", key)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error: allError } = await supabase
      .from("pengaturan")
      .select("*");

    if (allError) throw allError;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    // Validate required fields
    if (!key || !value) {
      return NextResponse.json(
        { error: "Missing required fields: key, value" },
        { status: 400 }
      );
    }

    // Validate key is allowed
    if (!ALLOWED_KEYS.includes(key)) {
      return NextResponse.json(
        { error: "Invalid setting key" },
        { status: 400 }
      );
    }

    // Validate value length
    if (typeof value !== "string" || value.length > 5000) {
      return NextResponse.json(
        { error: "Value must be a string under 5000 characters" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Upsert the setting
    const { data, error } = await supabase
      .from("pengaturan")
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "key",
        }
      )
      .select()
      .single();

    if (error) throw error;

    // Invalidate in-memory cache by clearing it
    // Since we can't directly modify the module state from here,
    // the cache will naturally expire after TTL
    // Alternatively, we could use a shared cache mechanism (e.g., Redis) but overkill

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
