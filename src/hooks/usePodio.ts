"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { ApostaPodio, Pais, PodioOficial } from "@/lib/types";

interface PodioData {
  paises: Pais[];
  apostaPodio: ApostaPodio[];
  podioOficial: PodioOficial[];
}

export function usePodio() {
  return useQuery({
    queryKey: ["podio"],
    queryFn: () => apiClient.get<PodioData>("/podio").then((r) => r.data),
    staleTime: Infinity,
  });
}

export function useSalvarPodio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (previsoes: Array<{ posicao: 1 | 2 | 3; pais_id: number }>) =>
      apiClient.put("/podio", previsoes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["podio"] }),
  });
}
