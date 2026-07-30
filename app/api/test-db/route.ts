import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "US";
  const supabase = await createClient();
  const { data, error } = await supabase.from("playable_content").select("*").contains("available_regions", [region]);
  return NextResponse.json({ data, error });
}
