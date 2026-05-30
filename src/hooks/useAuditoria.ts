"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { Partida, Perfil, Jogador, Pais } from "@/lib/types";

interface ApostaPalpite {
  user_id: string;
  gols_time_a: number;
  gols_time_b: number;
}

interface ApostaPodioComPais {
  user_id: string;
  posicao: 1 | 2 | 3;
  pais_id: number;
  pais: Pais;
}

interface PrevisaoGrupoComPais {
  user_id: string;
  pais_id: number;
  posicao: 1 | 2 | 3 | 4;
  terceiro_avanca: boolean;
  pais: Pais & { grupo: string };
}

interface ApostaArtilheiroComJogador {
  user_id: string;
  jogador_id: number;
  jogador: Jogador;
}

export interface AuditoriaData {
  perfis: Perfil[];
  palpites: {
    partida: Partida;
    apostas: ApostaPalpite[];
  }[];
  podio: ApostaPodioComPais[] | null;
  grupos: PrevisaoGrupoComPais[] | null;
  artilheiro: ApostaArtilheiroComJogador[] | null;
  prazoPrevisoesEncerrado: boolean;
}

export function useAuditoria() {
  return useQuery({
    queryKey: ["auditoria"],
    queryFn: () =>
      apiClient.get<AuditoriaData>("/auditoria").then((r) => r.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
