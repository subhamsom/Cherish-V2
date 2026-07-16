import { LandingAsk } from "@/components/cherish/landing/LandingAsk";
import { LandingClose } from "@/components/cherish/landing/LandingClose";
import { LandingFaq } from "@/components/cherish/landing/LandingFaq";
import { LandingHero } from "@/components/cherish/landing/LandingHero";
import { LandingHowItWorks } from "@/components/cherish/landing/LandingHowItWorks";
import { LandingMoments } from "@/components/cherish/landing/LandingMoments";
import { LandingPortrait } from "@/components/cherish/landing/LandingPortrait";
import { LandingReminders } from "@/components/cherish/landing/LandingReminders";
import { LandingWhisper } from "@/components/cherish/landing/LandingWhisper";
import { WHISPERS } from "@/components/cherish/landing/landing-demo-data";

export default function PublicRootLanding() {
  return (
    <main className="bg-[#F7F1E6]">
      <LandingHero />
      <LandingHowItWorks />
      <LandingMoments />
      <LandingWhisper text={WHISPERS.beforePortrait} />
      <LandingPortrait />
      <LandingReminders />
      <LandingWhisper text={WHISPERS.beforeAsk} />
      <LandingAsk />
      <LandingFaq />
      <LandingClose />
    </main>
  );
}
