import { redirect } from "next/navigation";
import { resolveSignedInMobileHome } from "@/lib/resolveSignedInMobileHome";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const result = await resolveSignedInMobileHome();
  if (result.kind === "anonymous") {
    redirect("/");
  }
  return result.node;
}
