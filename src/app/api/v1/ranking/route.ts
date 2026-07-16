import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getRankingData } from "@/lib/services/ranking.service";
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

export async function GET() {
  try {
    await requireSession();
    const {
      perfis,
      apostas,
      apostasArtilheiro,
      artilheiroOficialIds,
      totalPartidasFinalizadas,
      apostasPodio,
      podioOficial,
      previsoesGrupo,
      posicaoOficialGrupo,
      snapshotMap,
    } = await getRankingData();

    const ranking = calcularRanking(
      perfis as Perfil[],
      apostas as Aposta[],
      apostasArtilheiro as ApostaArtilheiro[],
      artilheiroOficialIds,
      apostasPodio as ApostaPodio[],
      podioOficial as PodioOficial[],
      previsoesGrupo as PrevisaoGrupo[],
      posicaoOficialGrupo as PosicaoOficialGrupo[],
      snapshotMap,
    );

    return NextResponse.json({ ranking, totalPartidasFinalizadas });
  } catch (e) {
    return handleApiError(e);
  }
}
