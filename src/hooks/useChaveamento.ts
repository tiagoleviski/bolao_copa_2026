"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type {
  FaseChaveamento,
  Pais,
  PrevisaoChaveamento,
  PrevisaoGrupo,
} from "@/lib/types";

interface ChaveamentoData {
  paises: Pais[];
  previsoesGrupo: PrevisaoGrupo[];
  previsoesChaveamento: PrevisaoChaveamento[];
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

export function useSalvarSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      fase: FaseChaveamento;
      slot: number;
      paisId: number | null;
    }) => apiClient.post("/chaveamento/slot", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chaveamento"] }),
  });
}

export function useLimparChaveamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete("/chaveamento/slot"),
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

export function useSalvarChaveamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      previsoes: Pick<PrevisaoChaveamento, "fase" | "slot" | "pais_id">[],
    ) => {
      await apiClient.delete("/chaveamento/slot");
      await Promise.all(
        previsoes.map((p) =>
          apiClient.post("/chaveamento/slot", {
            fase: p.fase,
            slot: p.slot,
            paisId: p.pais_id,
          }),
        ),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chaveamento"] }),
  });
}
