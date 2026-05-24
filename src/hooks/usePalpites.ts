"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { Aposta, Partida } from "@/lib/types";

export function usePalpites() {
  return useQuery({
    queryKey: ["palpites"],
    queryFn: async () => {
      const [{ data: partidas }, { data: apostas }] = await Promise.all([
        apiClient.get<Partida[]>("/partidas"),
        apiClient.get<Aposta[]>("/apostas"),
      ]);
      const apostasMap = new Map<number, Aposta>(
        apostas.map((a) => [a.partida_id, a]),
      );
      return { partidas, apostasMap };
    },
  });
}

export function useSalvarAposta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      partidaId: number;
      golsTimeA: number;
      golsTimeB: number;
    }) => apiClient.post("/apostas", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["palpites"] }),
  });
}
