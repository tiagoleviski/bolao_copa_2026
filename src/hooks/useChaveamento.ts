"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { Pais, PosicaoOficialGrupo, PrevisaoGrupo } from "@/lib/types";

interface ChaveamentoData {
  paises: Pais[];
  previsoesGrupo: PrevisaoGrupo[];
  posicoesOficiais: PosicaoOficialGrupo[];
}

export function useChaveamento() {
  return useQuery({
    queryKey: ["chaveamento"],
    queryFn: () =>
      apiClient.get<ChaveamentoData>("/chaveamento").then((r) => r.data),
    staleTime: Infinity,
  });
}

export function useSalvarGrupo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      paisId: number;
      posicao: 1 | 2 | 3 | 4 | null;
      terceiroAvanca?: boolean;
    }) => apiClient.post("/chaveamento/grupo", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chaveamento"] }),
  });
}

export type PrevisaoLocal = {
  pais_id: number;
  posicao: 1 | 2 | 3;
  terceiro_avanca: boolean;
};

export function useSalvarGrupos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (previsoes: PrevisaoLocal[]) =>
      apiClient.put("/chaveamento/grupo", previsoes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chaveamento"] }),
  });
}
