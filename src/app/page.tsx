import { redirect } from "next/navigation";
import { resolveSignedInMobileHome } from "@/lib/resolveSignedInMobileHome";
import MobileHomeMock from "@/components/MobileHomeMock";
import PublicRootLanding from "@/components/PublicRootLanding";

export const dynamic = "force-dynamic";

export default async function Home() {
  const result = await resolveSignedInMobileHome();
  if (result.kind === "anonymous") return <PublicRootLanding />;
  if (result.kind === "no_partner") redirect("/onboarding");
  return <MobileHomeMock appNavigation />;
}
