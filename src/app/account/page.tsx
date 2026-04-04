import { redirect } from "next/navigation";
import { createServerComponentSupabaseClient } from "@/lib/supabase-server";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
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
    .select("name, email")
    .eq("id", user.id)
    .maybeSingle();

  const meta = (user.user_metadata as Record<string, unknown> | null) ?? null;
  const fallbackName =
    (meta?.full_name as string | undefined) ?? (meta?.name as string | undefined) ?? "Unknown";

  const name = userRow.data?.name ?? fallbackName;
  const email = userRow.data?.email ?? user.email ?? "unknown@example.com";
  const initial = name.trim().charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || "?";

  return (
    <AccountClient userName={name} userEmail={email} userInitial={initial} />
  );
}
