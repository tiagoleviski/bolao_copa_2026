import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getRankingData } from "@/lib/services/ranking.service";
import { calcularRanking } from "@/lib/scoring";
import type {
  Aposta,
  ApostaArtilheiro,
  Perfil,
  PrevisaoClassificacao,
} from "@/lib/types";

export async function GET() {
  try {
    await requireSession();
    const {
      perfis,
      apostas,
      previsoes,
      apostasArtilheiro,
      artilheiroOficialId,
      classificacaoOficial,
      totalPartidasFinalizadas,
    } = await getRankingData();

    const ranking = calcularRanking(
      perfis as Perfil[],
      apostas as Aposta[],
      previsoes as PrevisaoClassificacao[],
      classificacaoOficial,
      apostasArtilheiro as ApostaArtilheiro[],
      artilheiroOficialId,
    );

    return NextResponse.json({ ranking, totalPartidasFinalizadas });
  } catch (e) {
    return handleApiError(e);
  }
}
