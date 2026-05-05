import { useQuery } from "@tanstack/react-query";

export const MEMORIES_QUERY_KEY = ["memories"] as const;

export type MemoryRow = {
  id: string;
  title: string | null;
  content: string;
  type: string;
  tags: string[] | null;
  liked: boolean | null;
  pinned: boolean | null;
  audio_url: string | null;
  image_url: string | null;
  memory_date: string;
  created_at: string | null;
};

export async function fetchMemories(): Promise<MemoryRow[]> {
  const response = await fetch("/api/memories");
  if (!response.ok) {
    throw new Error("Could not load memories");
  }
  const json = (await response.json()) as { data?: MemoryRow[] };
  return json.data ?? [];
}

export function useMemories() {
  return useQuery({
    queryKey: MEMORIES_QUERY_KEY,
    queryFn: fetchMemories,
  });
}
