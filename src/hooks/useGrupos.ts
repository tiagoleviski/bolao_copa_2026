"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { ClassificacaoEquipe, ClassificacaoGrupos } from "@/lib/types";

interface GruposData {
  classificacao: ClassificacaoGrupos;
  terceiros: ClassificacaoEquipe[];
}

export function useGrupos() {
  return useQuery({
    queryKey: ["grupos"],
    queryFn: () => apiClient.get<GruposData>("/grupos").then((r) => r.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
