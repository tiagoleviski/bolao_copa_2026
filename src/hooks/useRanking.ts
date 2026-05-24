"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { RankingEntry } from "@/lib/types";

interface RankingData {
  ranking: RankingEntry[];
  totalPartidasFinalizadas: number;
}

export function useRanking() {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: () => apiClient.get<RankingData>("/ranking").then((r) => r.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
