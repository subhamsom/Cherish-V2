import { useQuery, useQueryClient } from "@tanstack/react-query";

export const PARTNER_QUERY_KEY = ["partner"] as const;

export type Partner = {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  relationship_start_date: string | null;
  bio: string | null;
};

export async function fetchPartner(): Promise<Partner | null> {
  const response = await fetch("/api/partners");
  if (!response.ok) {
    throw new Error("Could not load partner");
  }
  const json = (await response.json()) as { partner: Partner | null };
  return json.partner;
}

export function usePartner() {
  const queryClient = useQueryClient();
  void queryClient;
  return useQuery({
    queryKey: PARTNER_QUERY_KEY,
    queryFn: fetchPartner,
  });
}
