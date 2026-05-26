"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { Jogador } from "@/lib/types";

interface ApostaArtilheiroAtual {
  jogador_id: number;
}

interface ArtilheiroData {
  jogadores: Jogador[];
  apostaAtual: ApostaArtilheiroAtual | null;
}

export function useArtilheiro() {
  return useQuery({
    queryKey: ["artilheiro"],
    queryFn: () =>
      apiClient.get<ArtilheiroData>("/artilheiro").then((r) => r.data),
    staleTime: Infinity,
  });
}

export function useSalvarApostaArtilheiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { jogadorId: number }) =>
      apiClient.post("/artilheiro", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["artilheiro"] }),
  });
}

export function useDeletarApostaArtilheiro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete("/artilheiro"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["artilheiro"] }),
  });
}
