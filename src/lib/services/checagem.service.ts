import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/fetch-all";
import { GRUPOS } from "@/lib/constants";

// Fases dos palpites de jogos, na ordem da competição. Cada fase agrupa uma ou
// mais "rodadas" (campo partidas.rodada).
export const FASES_PALPITES: { key: string; label: string; rodadas: number[] }[] = [
  { key: "r1", label: "1ª rod.", rodadas: [1] },
  { key: "r2", label: "2ª rod.", rodadas: [2] },
  { key: "r3", label: "3ª rod.", rodadas: [3] },
  { key: "segundaFase", label: "2ª fase", rodadas: [4] },
  { key: "oitavas", label: "Oitavas", rodadas: [5] },
  { key: "quartas", label: "Quartas", rodadas: [6] },
  { key: "semi", label: "Semi", rodadas: [7] },
  { key: "final", label: "Final", rodadas: [8, 9] },
];

function faseDaRodada(rodada: number | null): string | null {
  if (rodada === null) return null;
  return FASES_PALPITES.find((f) => f.rodadas.includes(rodada))?.key ?? null;
}

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

export async function getChecagemData(): Promise<ChecagemData> {
  const supabase = createAdminClient();

  const [perfis, partidas, apostas, podio, grupos, artilheiro] =
    await Promise.all([
      fetchAllRows<{ id: string; nome_completo: string; email: string }>(
        (f, t) =>
          supabase
            .from("perfis")
            .select("id, nome_completo, email")
            .order("nome_completo")
            .range(f, t),
      ),
      fetchAllRows<{ id: number; rodada: number | null }>((f, t) =>
        supabase.from("partidas").select("id, rodada").range(f, t),
      ),
      fetchAllRows<{ user_id: string; partida_id: number }>((f, t) =>
        supabase.from("apostas").select("user_id, partida_id").range(f, t),
      ),
      fetchAllRows<{ user_id: string }>((f, t) =>
        supabase.from("aposta_podio").select("user_id").range(f, t),
      ),
      fetchAllRows<{
        user_id: string;
        posicao: number;
        pais: { grupo: string } | { grupo: string }[] | null;
      }>((f, t) =>
        supabase
          .from("previsao_grupo")
          .select("user_id, posicao, pais:pais_id(grupo)")
          .range(f, t),
      ),
      fetchAllRows<{ user_id: string }>((f, t) =>
        supabase.from("apostas_artilheiro").select("user_id").range(f, t),
      ),
    ]);

  // partida_id -> fase; e total de partidas por fase
  const faseDaPartida = new Map<number, string>();
  const totalPorFase = new Map<string, number>();
  for (const p of partidas) {
    const fase = faseDaRodada(p.rodada);
    if (!fase) continue;
    faseDaPartida.set(p.id, fase);
    totalPorFase.set(fase, (totalPorFase.get(fase) ?? 0) + 1);
  }

  // palpites por usuário por fase
  const palpitesPorUserFase = new Map<string, Map<string, number>>();
  for (const a of apostas) {
    const fase = faseDaPartida.get(a.partida_id);
    if (!fase) continue;
    if (!palpitesPorUserFase.has(a.user_id))
      palpitesPorUserFase.set(a.user_id, new Map());
    const m = palpitesPorUserFase.get(a.user_id)!;
    m.set(fase, (m.get(fase) ?? 0) + 1);
  }

  const podioPorUser = new Map<string, number>();
  for (const p of podio) {
    podioPorUser.set(p.user_id, (podioPorUser.get(p.user_id) ?? 0) + 1);
  }

  const artilheiroSet = new Set(artilheiro.map((a) => a.user_id));

  // Grupos: grupos com 1º E 2º definidos, e quantos 3ºs avançam
  const primeirosPorUser = new Map<string, Set<string>>();
  const segundosPorUser = new Map<string, Set<string>>();
  const terceirosPorUser = new Map<string, number>();
  for (const g of grupos) {
    const paisRel = Array.isArray(g.pais) ? g.pais[0] : g.pais;
    const grupo = paisRel?.grupo;
    if (!grupo) continue;
    if (g.posicao === 1) {
      if (!primeirosPorUser.has(g.user_id))
        primeirosPorUser.set(g.user_id, new Set());
      primeirosPorUser.get(g.user_id)!.add(grupo);
    } else if (g.posicao === 2) {
      if (!segundosPorUser.has(g.user_id))
        segundosPorUser.set(g.user_id, new Set());
      segundosPorUser.get(g.user_id)!.add(grupo);
    } else if (g.posicao === 3) {
      terceirosPorUser.set(g.user_id, (terceirosPorUser.get(g.user_id) ?? 0) + 1);
    }
  }

  const usuarios: ChecagemUsuario[] = perfis.map((perfil) => {
    const primeiros = primeirosPorUser.get(perfil.id) ?? new Set<string>();
    const segundos = segundosPorUser.get(perfil.id) ?? new Set<string>();
    const gruposCompletos = GRUPOS.filter(
      (g) => primeiros.has(g) && segundos.has(g),
    ).length;

    const mFases = palpitesPorUserFase.get(perfil.id);
    const palpitesPorFase: Record<string, number> = {};
    for (const fase of FASES_PALPITES) {
      palpitesPorFase[fase.key] = mFases?.get(fase.key) ?? 0;
    }

    return {
      user_id: perfil.id,
      nome_completo: perfil.nome_completo,
      email: perfil.email,
      palpitesPorFase,
      podio: Math.min(podioPorUser.get(perfil.id) ?? 0, 3),
      gruposCompletos,
      terceiros: terceirosPorUser.get(perfil.id) ?? 0,
      artilheiro: artilheiroSet.has(perfil.id),
    };
  });

  return {
    usuarios,
    fases: FASES_PALPITES.map((f) => ({
      key: f.key,
      label: f.label,
      total: totalPorFase.get(f.key) ?? 0,
    })),
    totalGrupos: GRUPOS.length,
    totalTerceiros: 8,
  };
}
