"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  var __fthSupabase: SupabaseClient | undefined;
}

export const supabase =
  globalThis.__fthSupabase ??
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

if (process.env.NODE_ENV !== "production") {
  globalThis.__fthSupabase = supabase;
}