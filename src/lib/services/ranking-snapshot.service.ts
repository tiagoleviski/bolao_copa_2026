import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getRankingData } from "./ranking.service";
import { calcularRanking } from "@/lib/scoring";
import type {
  Aposta,
  ApostaArtilheiro,
  ApostaPodio,
  Perfil,
  PodioOficial,
  PosicaoOficialGrupo,
  PrevisaoGrupo,
} from "@/lib/types";

export async function captureRankingSnapshot(): Promise<void> {
  const data = await getRankingData();
  const snapshotMap = await getSnapshotMap();

  const ranking = calcularRanking(
    data.perfis as Perfil[],
    data.apostas as Aposta[],
    data.apostasArtilheiro as ApostaArtilheiro[],
    data.artilheiroOficialId,
    data.apostasPodio as ApostaPodio[],
    data.podioOficial as PodioOficial[],
    data.previsoesGrupo as PrevisaoGrupo[],
    data.posicaoOficialGrupo as PosicaoOficialGrupo[],
    snapshotMap,
  );

  const supabase = createAdminClient();
  const rows = ranking.map((e) => ({ user_id: e.user_id, posicao: e.posicao }));
  await supabase
    .from("ranking_snapshot")
    .upsert(rows, { onConflict: "user_id" });
}

export async function getSnapshotMap(): Promise<Map<string, number>> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("ranking_snapshot")
    .select("user_id, posicao");
  if (!data) return new Map();
  return new Map(data.map((r) => [r.user_id as string, r.posicao as number]));
}
