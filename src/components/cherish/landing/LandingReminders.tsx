import { ReminderCard } from "@/components/cherish/cards/ReminderCard";
import { demoReminders } from "@/components/cherish/landing/landing-demo-data";
import { LandingBlob } from "@/components/cherish/landing/LandingBlob";
import { LandingDust } from "@/components/cherish/landing/LandingDust";
import { LandingReveal } from "@/components/cherish/landing/LandingReveal";
import { LandingSectionLabel } from "@/components/cherish/landing/LandingSectionLabel";

export function LandingReminders() {
  const reminders = demoReminders();

  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      <LandingBlob className="bottom-[-80px] right-[-120px] size-[360px] bg-[#FF6B6C] opacity-[0.05]" />
      <LandingDust />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
        <LandingSectionLabel text="It holds the dates" />
        <h2 className="font-serif text-3xl font-bold text-zinc-900 md:text-4xl">
          Some dates shouldn&apos;t rely on memory.
        </h2>
        <p className="max-w-md font-sans text-base leading-relaxed text-zinc-500">
          Birthdays, anniversaries, the follow-ups you promised. One quiet email on the
          morning it matters, and a nudge inside the app. No push notifications. No noise.
        </p>
      </div>

      <div className="relative mx-auto mt-14 flex max-w-md flex-col gap-4">
        {reminders.map((reminder, i) => (
          <LandingReveal
            key={reminder.title}
            delay={i * 120}
            className="transition-transform duration-300 motion-safe:hover:-translate-y-1"
          >
            <ReminderCard
              title={reminder.title}
              note={reminder.note}
              date={reminder.date}
              urgent={reminder.urgent}
            />
          </LandingReveal>
        ))}
      </div>
    </section>
  );
}
