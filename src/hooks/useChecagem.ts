"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export interface ChecagemUsuario {
  user_id: string;
  nome_completo: string;
  email: string;
  palpitesPorFase: Record<string, number>;
  podio: number;
  gruposCompletos: number;
  terceiros: number;
  artilheiro: boolean;
}

export interface ChecagemData {
  usuarios: ChecagemUsuario[];
  fases: { key: string; label: string; total: number }[];
  totalGrupos: number;
  totalTerceiros: number;
}

export function useChecagem() {
  return useQuery({
    queryKey: ["checagem"],
    queryFn: () =>
      apiClient.get<ChecagemData>("/admin/checagem").then((r) => r.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
