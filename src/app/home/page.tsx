import { redirect } from "next/navigation";
import { resolveSignedInMobileHome } from "@/lib/resolveSignedInMobileHome";
import MobileHomeMock from "@/components/MobileHomeMock";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await resolveSignedInMobileHome();
  if (result.kind === "anonymous") redirect("/");
  if (result.kind === "no_partner") redirect("/onboarding");
  return <MobileHomeMock appNavigation />;
}
