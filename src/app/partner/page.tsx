import { redirect } from "next/navigation";
import { createServerComponentSupabaseClient } from "@/lib/supabase-server";
import ProfileClient from "@/app/profile/ProfileClient";

export const dynamic = "force-dynamic";

export default async function PartnerPage() {
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
    .select("id, user_id, name, photo_url, relationship_start_date")
    .eq("user_id", user.id)
    .maybeSingle();

  const partner = partnerResult.error ? null : partnerResult.data;

  return (
    <ProfileClient
      userEmail={user.email ?? "unknown@example.com"}
      partner={partner}
    />
  );
}

