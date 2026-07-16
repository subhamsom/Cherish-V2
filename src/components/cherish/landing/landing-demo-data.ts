// Sample content for the public landing narrative — one fictional couple,
// written to the same voice rules as the in-app AI cards (restrained,
// observed, evidence-linked). The portrait cards below must only claim
// things the demo memories actually show.

export type DemoMemory = {
  id: string;
  title: string;
  content: string;
  memoryDate: string;
  tags: string[];
  imageUrl?: string;
};

export const DEMO_MEMORIES: DemoMemory[] = [
  {
    id: "wall",
    title: "Came home to my childhood on the wall",
    content: "A story I told her weeks ago, once. She kept every detail.",
    memoryDate: "2026-04-12",
    tags: ["grateful"],
    imageUrl: "/landing/wall-of-photos.jpg",
  },
  {
    id: "joke",
    title: "She remembered the joke from three years ago",
    content: "We were in line for coffee and she quoted it word for word.",
    memoryDate: "2026-04-04",
    tags: ["funny"],
  },
  {
    id: "book",
    title: "The page she folded in my book",
    content: "I mentioned the ending once. She read the whole thing to see what I meant.",
    memoryDate: "2026-03-18",
    tags: ["quiet moment"],
  },
  {
    id: "tuesday",
    title: "An ordinary Tuesday",
    content: "“You’re the calmest part of my day.” Then she went back to her tea.",
    memoryDate: "2026-03-02",
    tags: ["grateful"],
  },
];

export const DEMO_VOICE_NOTE = {
  title: "Late night on the porch",
  memoryDate: "2026-04-02",
  duration: "0:47",
  transcript:
    "…and she said we should do this every Sunday, and I didn’t say anything, because I didn’t want to jinx it…",
  tags: ["romantic"],
};

export type DemoPortraitCard = {
  card: {
    title: string;
    content_type: "paragraph" | "list";
    content: string | string[];
  };
  /** ids of DEMO_MEMORIES this insight is drawn from */
  evidence: string[];
};

export const DEMO_PORTRAIT_CARDS: DemoPortraitCard[] = [
  {
    card: {
      title: "SHE LOVES",
      content_type: "list",
      content: ["Your bad puns", "Tea after long days", "Finishing the book first"],
    },
    evidence: ["joke", "tuesday", "book"],
  },
  {
    card: {
      title: "SHE FILES THINGS AWAY",
      content_type: "paragraph",
      content:
        "You mentioned it once, weeks before. It came back as a room strung with lights. Nothing you tell her really disappears.",
    },
    evidence: ["wall", "book"],
  },
  {
    card: {
      title: "WHAT SHE SEES IN YOU",
      content_type: "paragraph",
      content:
        "Her words, kept from an ordinary Tuesday: “You’re the calmest part of my day.”",
    },
    evidence: ["tuesday"],
  },
];

export const DEMO_ASK_EXCHANGES = [
  {
    question: "What should I get her for her birthday? Something personal.",
    answer:
      "She folded a page in the book you mentioned once — she reads what you read. Start there. The sequel, with a note inside.",
  },
  {
    question: "It's been a heavy week for her.",
    answer:
      "Tea, the porch, no plans. She said those Sundays were her favorite — no reason it can't be a Wednesday.",
  },
];

export type DemoReminder = {
  title: string;
  note: string;
  date: string;
  urgent: boolean;
};

export function demoReminders(): DemoReminder[] {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);
  return [
    {
      title: "Book the table for Friday",
      note: "The corner one, by the window.",
      date: todayIso,
      urgent: true,
    },
    {
      title: "Ask how the interview went",
      note: "She was nervous about Thursday.",
      date: tomorrowIso,
      urgent: false,
    },
    {
      title: "Her birthday",
      note: "Gift is sorted. Card is not.",
      date: "2026-08-15",
      urgent: false,
    },
  ];
}

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Can my partner see what I save?",
    answer:
      "No — and that's the whole idea. Cherish isn't a shared app or a couples' feed. It's your private notebook about someone you love. They never get a login, a notification, or a peek. What you write stays entirely on your side of the story.",
  },
  {
    question: "Does my partner need Cherish too?",
    answer:
      "No. Most couples' apps only work when both people download them, sign up, and keep up. Cherish works alone from day one. It takes one person paying attention — that's you.",
  },
  {
    question: "What kinds of things do I save?",
    answer:
      "Small ones, mostly. A line they said in passing. A gift idea you'd forget by Friday. The way they showed up for you during a hard week. Write a sentence or a whole story, add a photo, tag it if you like — most memories take about ten seconds to save.",
  },
  {
    question: "What does Cherish do with all of it?",
    answer:
      "It reads across everything you've saved and builds a living portrait of your partner — the patterns, preferences, and quiet habits that are easy to feel but hard to name. Every insight is grounded in moments you actually saved, and you can always see exactly which ones.",
  },
  {
    question: "How do reminders work?",
    answer:
      "You save the date — a birthday, an anniversary, a promise to follow up — and Cherish sends you one quiet email on the morning it matters, plus a gentle nudge inside the app. No push notifications, no badges, no noise.",
  },
  {
    question: "Can I delete everything?",
    answer:
      "Yes, completely. Your memories belong to you. Delete your account and everything goes with it — every memory, every reminder, the portrait itself.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Nothing right now. Cherish is in early access — everything you see is free while it grows. If that ever changes, you'll hear it from us first, and your memories will always stay yours.",
  },
];

export const WHISPERS = {
  beforePortrait: "Threading the patterns you never named",
  beforeAsk: "Reading what care looks like between you",
};
