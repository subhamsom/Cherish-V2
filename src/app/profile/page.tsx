import { redirect } from "next/navigation";
import { createServerComponentSupabaseClient } from "@/lib/supabase-server";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerComponentSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

  const partnerResult = await supabase
    .from("partners")
    .select("id, user_id, name, photo_url, relationship_start_date, bio")
    .eq("user_id", user.id)
    .maybeSingle();

  const partner = partnerResult.error ? null : partnerResult.data;

  return <ProfileClient partner={partner} />;
}

