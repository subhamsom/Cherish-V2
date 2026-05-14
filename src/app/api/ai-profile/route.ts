import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { CHERISH_AI_PROMPT } from "@/lib/cherish-ai-prompt";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-5";

type AnthropicTextBlock = { type: "text"; text: string };
type AnthropicContentBlock = AnthropicTextBlock | { type: string; [key: string]: unknown };

function stripMarkdownCodeFences(text: string): string {
  let t = text.trim();
  t = t.replace(/^```json\s*/i, "");
  t = t.replace(/^```\s*/, "");
  t = t.replace(/\s*```\s*$/, "");
  return t.trim();
}

function buildUserMessage(partner: {
  name: string;
  pronoun: string | null;
}, memories: { title: string | null; content: string | null; memory_date: string }[]): string {
  const nameLine = `Partner name: ${partner.name.trim() || "(unknown)"}`;
  const pronounLine =
    partner.pronoun != null && partner.pronoun.trim() !== ""
      ? `Pronoun: ${partner.pronoun.trim()}`
      : "No pronoun is available. Use the partner's name instead of pronouns when referring to them.";

  const header = [nameLine, pronounLine, "", "Memories:", ""].join("\n");

  const listLines = (memories ?? []).map((m, i) => {
    const n = i + 1;
    const title = (m.title ?? "").trim() || "(no title)";
    const content = (m.content ?? "").trim();
    if (!content) {
      return `${n}. ${title}`;
    }
    return `${n}. ${title}\n${content}`;
  });

  return header + listLines.join("\n\n");
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({});
  const supabase = createServerSupabaseClient(req, res);

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id, name, pronoun, ai_cards, ai_generated_at, ai_memory_count")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (partnerError) {
    return NextResponse.json(
      { error: "Could not load partner", details: partnerError.message },
      { status: 500 },
    );
  }

  if (!partner) {
    return NextResponse.json({ error: "No partner found" }, { status: 404 });
  }

  const { data: memories, error: memoriesError } = await supabase
    .from("memories")
    .select("title, content, memory_date")
    .eq("user_id", session.user.id)
    .order("memory_date", { ascending: true });

  if (memoriesError) {
    return NextResponse.json(
      { error: "Could not load memories", details: memoriesError.message },
      { status: 500 },
    );
  }

  const memoryList = memories ?? [];
  const memoryCount = memoryList.length;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return NextResponse.json(
      { error: "Server misconfiguration: ANTHROPIC_API_KEY is not set." },
      { status: 500 },
    );
  }

  const userMessage = buildUserMessage(
    { name: partner.name, pronoun: partner.pronoun },
    memoryList,
  );

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        system: CHERISH_AI_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Claude API request failed.", details: message },
      { status: 500 },
    );
  }

  const rawBody = await anthropicResponse.text();
  if (!anthropicResponse.ok) {
    return NextResponse.json(
      {
        error: "Claude API returned an error.",
        status: anthropicResponse.status,
        details: rawBody.slice(0, 2000),
      },
      { status: 500 },
    );
  }

  let parsedAnthropic: { content?: AnthropicContentBlock[] };
  try {
    parsedAnthropic = JSON.parse(rawBody) as { content?: AnthropicContentBlock[] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Claude API response was not valid JSON.", details: message },
      { status: 500 },
    );
  }

  const blocks = parsedAnthropic.content;
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return NextResponse.json(
      { error: "Claude API response had no content blocks.", details: rawBody.slice(0, 500) },
      { status: 500 },
    );
  }

  const first = blocks[0];
  if (!first || first.type !== "text" || typeof (first as AnthropicTextBlock).text !== "string") {
    return NextResponse.json(
      { error: "Claude API first content block was not a text block.", details: JSON.stringify(first) },
      { status: 500 },
    );
  }

  const assistantText = (first as AnthropicTextBlock).text;
  const cleaned = stripMarkdownCodeFences(assistantText);

  let cards: unknown;
  try {
    const parsed = JSON.parse(cleaned) as { cards?: unknown };
    if (!parsed || typeof parsed !== "object" || !("cards" in parsed)) {
      return NextResponse.json(
        { error: "Parsed JSON did not contain a top-level \"cards\" property.", details: cleaned.slice(0, 500) },
        { status: 500 },
      );
    }
    if (!Array.isArray(parsed.cards)) {
      return NextResponse.json(
        { error: "Parsed JSON \"cards\" was not an array.", details: cleaned.slice(0, 500) },
        { status: 500 },
      );
    }
    cards = parsed.cards;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Could not parse Claude output as JSON.", details: message, snippet: cleaned.slice(0, 500) },
      { status: 500 },
    );
  }

  const { error: updateError } = await supabase
    .from("partners")
    .update({
      ai_cards: cards,
      ai_generated_at: new Date().toISOString(),
      ai_memory_count: memoryCount,
    })
    .eq("id", partner.id);

  if (updateError) {
    console.error("Failed to save AI profile to partner:", updateError);
  }

  return NextResponse.json({ cards, memoryCount }, { status: 200 });
}
