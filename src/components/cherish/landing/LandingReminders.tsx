import { ReminderCard } from "@/components/cherish/cards/ReminderCard";
import { demoReminders } from "@/components/cherish/landing/landing-demo-data";
import { LandingGrain } from "@/components/cherish/landing/LandingGrain";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";
import { TiltCard } from "@/components/cherish/landing/TiltCard";

export function LandingReminders() {
  const reminders = demoReminders();

  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-28">
      <LandingGrain />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <LandingSectionLabel text="It holds the dates" />
        <h2 className="font-serif text-4xl font-bold text-[#22315F] md:text-5xl">
          Some dates shouldn&apos;t rely on <em className="italic">memory</em>
          <span className="text-[#BC4B3C]">.</span>
        </h2>
        <p className="max-w-md font-sans text-base leading-relaxed text-[#22315F]/75">
          Birthdays, anniversaries, the follow-ups you promised. One quiet email on the
          morning it matters, and a nudge inside the app. No push notifications. No noise.
        </p>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-md flex-col gap-4 md:max-w-4xl md:grid md:grid-cols-3 md:items-start">
        {reminders.map((reminder, i) => (
          <LandingReveal key={reminder.title} delay={i * 120}>
            <TiltCard maxTilt={4}>
              <ReminderCard
                title={reminder.title}
                note={reminder.note}
                date={reminder.date}
                urgent={reminder.urgent}
              />
            </TiltCard>
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
