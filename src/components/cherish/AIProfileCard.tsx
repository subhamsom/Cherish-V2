export type AiCard = {
  title: string;
  content_type: "paragraph" | "bullets" | "list";
  content: string | string[];
};

export function isAiCard(value: unknown): value is AiCard {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.title !== "string") return false;
  const ct = o.content_type;
  if (ct !== "paragraph" && ct !== "bullets" && ct !== "list") return false;
  const c = o.content;
  if (ct === "paragraph") {
    return typeof c === "string";
  }
  if (ct === "list" || ct === "bullets") {
    return Array.isArray(c) && c.every((item) => typeof item === "string");
  }
  return false;
}

export type AIProfileCardProps = {
  card: unknown;
  isFirst?: boolean;
};

export function AIProfileCard({ card, isFirst = false }: AIProfileCardProps) {
  if (!isAiCard(card)) return null;

  const titleColorClass = isFirst ? "text-[#FF6B6C]" : "text-zinc-500";

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3
        className={`mb-4 font-serif text-xs font-bold uppercase tracking-widest ${titleColorClass}`}
      >
        {card.title}
      </h3>

      {card.content_type === "list" ? (
        <div className="flex flex-col gap-2">
          {(card.content as string[]).map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 text-xs text-[#FF6B6C]">♥</span>
              <span className="font-serif text-base text-zinc-800">{item}</span>
            </div>
          ))}
        </div>
      ) : null}

      {card.content_type === "paragraph" ? (
        <p className="font-sans text-sm leading-relaxed text-zinc-700">{card.content as string}</p>
      ) : null}

      {card.content_type === "bullets" ? (
        <div className="flex flex-col gap-3">
          {(card.content as string[]).map((item, index) => (
            <p key={index} className="font-sans text-sm leading-relaxed text-zinc-700">
              {item}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
