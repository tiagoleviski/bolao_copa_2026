import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getRankingData } from "@/lib/services/ranking.service";
import { calcularRanking } from "@/lib/scoring";
import type {
  Aposta,
  ApostaArtilheiro,
  Perfil,
  PrevisaoChaveamento,
} from "@/lib/types";

export async function GET() {
  try {
    await requireSession();
    const {
      perfis,
      apostas,
      apostasArtilheiro,
      artilheiroOficialId,
      totalPartidasFinalizadas,
      previsoesChaveamento,
      resultadosChaveamentoOficiais,
    } = await getRankingData();

    const ranking = calcularRanking(
      perfis as Perfil[],
      apostas as Aposta[],
      apostasArtilheiro as ApostaArtilheiro[],
      artilheiroOficialId,
      previsoesChaveamento as PrevisaoChaveamento[],
      resultadosChaveamentoOficiais,
    );

    return NextResponse.json({ ranking, totalPartidasFinalizadas });
  } catch (e) {
    return handleApiError(e);
  }
}
