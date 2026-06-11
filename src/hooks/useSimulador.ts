"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { SimuladorData } from "@/lib/simulacao";

export function useSimulador() {
  return useQuery({
    queryKey: ["simulador"],
    queryFn: () =>
      apiClient.get<SimuladorData>("/simulador").then((r) => r.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
