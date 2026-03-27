import { redirect } from "next/navigation";
import { createServerComponentSupabaseClient } from "@/lib/supabase-server";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

function formatMemberSince(iso: string | null) {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function SettingsPage() {
  const supabase = await createServerComponentSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/");
  }

  const userRow = await supabase
    .from("users")
    .select("name, email, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const meta = (user.user_metadata as Record<string, unknown> | null) ?? null;
  const fallbackName =
    (meta?.full_name as string | undefined) ?? (meta?.name as string | undefined) ?? "Unknown";

  const name = userRow.data?.name ?? fallbackName;
  const email = userRow.data?.email ?? user.email ?? "unknown@example.com";
  const memberSince = formatMemberSince(userRow.data?.created_at ?? user.created_at ?? null);

  return <SettingsClient userName={name} userEmail={email} memberSince={memberSince} />;
}

