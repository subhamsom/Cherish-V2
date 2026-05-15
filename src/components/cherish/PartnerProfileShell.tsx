"use client";

import { AIProfileCard } from "@/components/cherish/AIProfileCard";
import { AskMeAnythingCard } from "@/components/cherish/AskMeAnythingCard";
import Image from "next/image";
import { Lock, Pencil } from "lucide-react";
import type { Partner } from "@/hooks/usePartner";

const MEMORY_THRESHOLD = 10;

type PartnerProfileShellPartner = Pick<
  Partner,
  "name" | "photo_url" | "relationship_start_date" | "bio" | "pronoun"
>;

export type PartnerProfileShellProps = {
  partner: PartnerProfileShellPartner;
  memoryCount: number;
  recurringCount: number;
  onEditClick: () => void;
  onAvatarClick?: () => void;
  aiCards: unknown[];
  aiLoading: boolean;
};

const ONES = [
  "ZERO",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
  "ELEVEN",
  "TWELVE",
  "THIRTEEN",
  "FOURTEEN",
  "FIFTEEN",
  "SIXTEEN",
  "SEVENTEEN",
  "EIGHTEEN",
  "NINETEEN",
] as const;

const TENS = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"] as const;

function numberToEnglishWordsUppercase(n: number): string {
  if (n < 0) return "ZERO";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const ten = Math.floor(n / 10);
    const one = n % 10;
    if (one === 0) return TENS[ten];
    return `${TENS[ten]}-${ONES[one]}`;
  }
  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    if (rest === 0) return `${ONES[hundreds]} HUNDRED`;
    return `${ONES[hundreds]} HUNDRED ${numberToEnglishWordsUppercase(rest)}`;
  }
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    if (rest === 0) return `${numberToEnglishWordsUppercase(thousands)} THOUSAND`;
    return `${numberToEnglishWordsUppercase(thousands)} THOUSAND ${numberToEnglishWordsUppercase(rest)}`;
  }
  return String(n);
}

function parseLocalYmd(ymd: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const mo = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (mo < 0 || mo > 11 || day < 1 || day > 31) return null;
  const d = new Date(y, mo, day);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  return d;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function totalCalendarMonthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return months;
}

function calculateRelationshipDuration(startDate: string | null): { label: string; months: number } {
  if (!startDate) return { label: "", months: 0 };
  const start = parseLocalYmd(startDate);
  if (!start) return { label: "", months: 0 };

  const today = startOfLocalDay(new Date());
  const startDay = startOfLocalDay(start);
  if (startDay > today) return { label: "", months: 0 };

  const months = totalCalendarMonthsBetween(startDay, today);
  if (months < 1) return { label: "JUST STARTED", months: 0 };

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  const yearPart =
    years === 0
      ? ""
      : `${numberToEnglishWordsUppercase(years)} ${years === 1 ? "YEAR" : "YEARS"}`;
  const monthPart =
    remMonths === 0
      ? ""
      : `${numberToEnglishWordsUppercase(remMonths)} ${remMonths === 1 ? "MONTH" : "MONTHS"}`;

  if (yearPart && monthPart) return { label: `${yearPart}, ${monthPart}`, months };
  if (yearPart) return { label: yearPart, months };
  return { label: monthPart, months };
}

export function PartnerProfileShell({
  partner,
  memoryCount,
  recurringCount,
  onEditClick,
  onAvatarClick,
  aiCards,
  aiLoading,
}: PartnerProfileShellProps) {
  const { label: durationLabel, months: monthsTogether } = calculateRelationshipDuration(
    partner.relationship_start_date,
  );
  const progressPercent = Math.min((memoryCount / 15) * 100, 100);

  const displayName = partner.name.trim() || "Partner";
  const initialLetter = displayName.charAt(0).toUpperCase() || "?";
  const subjectPronoun =
    partner.pronoun === "he" ? "HE" :
    partner.pronoun === "they" ? "THEY" :
    "SHE";
  const possessivePronoun =
    partner.pronoun === "he" ? "HIS" :
    partner.pronoun === "they" ? "THEIR" :
    "HER";

  return (
    <div className="bg-[#fafafa] pb-6">
      <div className="relative mx-auto w-full max-w-2xl px-4 pt-2">
        <section className="relative rounded-2xl bg-[#fafafa] px-1 pb-6 pt-8">
          <button
            type="button"
            onClick={onEditClick}
            className="absolute right-0 top-0 flex size-9 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm"
            aria-label="Edit partner"
          >
            <Pencil className="size-4 text-zinc-700" strokeWidth={2} aria-hidden />
          </button>

          <div className="flex flex-col items-center text-center">
            {onAvatarClick ? (
              <button
                type="button"
                onClick={onAvatarClick}
                aria-label="Change partner photo"
                className="size-[88px] rounded-full"
              >
                <div className="flex size-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FF6B6C]">
                  {partner.photo_url ? (
                    <Image
                      src={partner.photo_url}
                      alt={`${displayName} photo`}
                      width={88}
                      height={88}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-serif text-3xl font-bold text-white">{initialLetter}</span>
                  )}
                </div>
              </button>
            ) : (
              <div className="flex size-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FF6B6C]">
                {partner.photo_url ? (
                  <Image
                    src={partner.photo_url}
                    alt={`${displayName} photo`}
                    width={88}
                    height={88}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-3xl font-bold text-white">{initialLetter}</span>
                )}
              </div>
            )}

            {durationLabel ? (
              <p className="mt-4 font-sans text-xs font-normal uppercase tracking-widest text-zinc-400">
                TOGETHER FOR {durationLabel}
              </p>
            ) : null}

            <h1
              className={`font-serif text-4xl font-bold tracking-tight text-zinc-900 ${durationLabel ? "mt-2" : "mt-4"}`}
            >
              {displayName}
            </h1>

            <p className="mt-2 font-sans text-sm font-normal text-zinc-500">
              Built from {memoryCount} moment{memoryCount === 1 ? "" : "s"} you&apos;ve saved
            </p>
          </div>
        </section>

        <section className="mt-2 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-stretch">
            <div className="flex flex-1 flex-col items-center">
              <span className="font-serif text-2xl font-bold text-zinc-900">{memoryCount}</span>
              <span className="mt-0.5 font-sans text-xs font-normal uppercase tracking-widest text-zinc-400">
                MOMENTS
              </span>
            </div>
            <div className="w-px shrink-0 self-stretch bg-zinc-200" aria-hidden />
            <div className="flex flex-1 flex-col items-center">
              <span className="font-serif text-2xl font-bold text-zinc-900">{recurringCount}</span>
              <span className="mt-0.5 font-sans text-xs font-normal uppercase tracking-widest text-zinc-400">
                RECURRING
              </span>
            </div>
            <div className="w-px shrink-0 self-stretch bg-zinc-200" aria-hidden />
            <div className="flex flex-1 flex-col items-center">
              <span className="font-serif text-2xl font-bold text-zinc-900">
                {partner.relationship_start_date ? monthsTogether : "—"}
              </span>
              <span className="mt-0.5 font-sans text-xs font-normal uppercase tracking-widest text-zinc-400">
                MONTHS
              </span>
            </div>
          </div>
        </section>

        {memoryCount < MEMORY_THRESHOLD ? (
          <>
            <div className="mt-4 border-t-2 border-zinc-200" aria-hidden />

            <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <p className="font-serif text-lg font-bold text-zinc-900">
                  Cherish is still getting to know {displayName.split(" ")[0]}.
                </p>
                <p className="mt-2 font-sans text-sm font-normal text-zinc-500">
                  Save more specific moments and she&apos;ll start coming alive here.
                </p>
                <p className="mt-4 font-sans text-xs font-normal text-zinc-400">
                  {Math.min(memoryCount, 15)} of 15 moments saved
                </p>
                <div className="mt-2 h-1 w-full rounded-full bg-zinc-100">
                  <div
                    className="h-1 rounded-full bg-[#FF6B6C]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
              <p className="mb-3 font-serif text-xs uppercase tracking-widest text-zinc-900">
                {subjectPronoun} LOVES
              </p>
              <div className="blur-sm select-none">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs text-[#FF6B6C]">♥</span>
                    <span className="font-sans text-sm text-zinc-800">
                      The quiet corner of any room
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs text-[#FF6B6C]">♥</span>
                    <span className="font-sans text-sm text-zinc-800">
                      Mornings before anyone else is awake
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs text-[#FF6B6C]">♥</span>
                    <span className="font-sans text-sm text-zinc-800">
                      Books she already knows the ending of
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4">
                <Lock size={12} className="shrink-0 text-zinc-400" />
                <p className="font-sans text-xs text-zinc-400">
                  Save {MEMORY_THRESHOLD} moments to unlock
                </p>
              </div>
            </section>

            <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
              <p className="mb-3 font-serif text-xs uppercase tracking-widest text-zinc-900">
                {possessivePronoun} RITUALS
              </p>
              <div className="blur-sm select-none">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs text-[#FF6B6C]">♥</span>
                    <span className="font-sans text-sm text-zinc-800">
                      First chai before anything else
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs text-[#FF6B6C]">♥</span>
                    <span className="font-sans text-sm text-zinc-800">The long way home, always</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs text-[#FF6B6C]">♥</span>
                    <span className="font-sans text-sm text-zinc-800">
                      Rereading messages she wants to remember
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-4">
                <Lock size={12} className="shrink-0 text-zinc-400" />
                <p className="font-sans text-xs text-zinc-400">
                  Save {MEMORY_THRESHOLD} moments to unlock
                </p>
              </div>
            </section>
          </>
        ) : (
          <>
            {aiCards.length > 0 ? (
              <>
                <div className="mt-6">
                  <AIProfileCard key={0} card={aiCards[0]} isFirst={true} />
                </div>
                {aiCards.length > 1 ? (
                  <section className="mt-6">
                    <div className="mb-6 border-t-2 border-zinc-200" />
                    <p className="mb-4 font-serif text-sm font-bold uppercase tracking-widest text-[#FF6B6C]">
                      WHAT CHERISH NOTICED
                    </p>
                    <div className="flex flex-col gap-4">
                      {aiCards.slice(1).map((card, index) => (
                        <AIProfileCard key={index + 1} card={card} isFirst={false} />
                      ))}
                    </div>
                  </section>
                ) : null}
                <div className="mt-4">
                  <AskMeAnythingCard name={displayName.split(" ")[0]} />
                </div>
              </>
            ) : (
              <p className="py-8 text-center font-sans text-sm text-zinc-400">
                Building her profile...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
