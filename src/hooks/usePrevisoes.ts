"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type {
  FaseClassificacao,
  Pais,
  PrevisaoClassificacao,
} from "@/lib/types";

interface PrevisoesData {
  paises: Pais[];
  previsoes: PrevisaoClassificacao[];
}

export function usePrevisoes() {
  return useQuery({
    queryKey: ["previsoes"],
    queryFn: () =>
      apiClient.get<PrevisoesData>("/previsoes").then((r) => r.data),
    staleTime: Infinity,
  });
}

export function useSalvarPrevisaoFase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { fase: FaseClassificacao; paisIds: number[] }) =>
      apiClient.post("/previsoes/fase", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["previsoes"] }),
  });
}

export function useSalvarPosicaoEspecifica() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { fase: FaseClassificacao; paisId: number | null }) =>
      apiClient.post("/previsoes/posicao", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["previsoes"] }),
  });
}
