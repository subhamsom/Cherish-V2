import PublicRootLanding from "@/components/PublicRootLanding";
import { resolveSignedInMobileHome } from "@/lib/resolveSignedInMobileHome";

export const dynamic = "force-dynamic";

export default async function Home() {
  const result = await resolveSignedInMobileHome();
  if (result.kind === "anonymous") {
    return <PublicRootLanding />;
  }
  return result.node;
}
