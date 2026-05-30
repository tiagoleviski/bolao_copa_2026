import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/lib/supabase/server";
import {
  calcularClassificacaoGrupos,
  rankearTerceirosLugares,
} from "@/lib/services/classificacao.service";

export const revalidate = 60;

export async function GET() {
  try {
    await requireSession();
    const supabase = await createClient();

    const [{ data: partidas, error: eP }, { data: paises, error: ePaises }] =
      await Promise.all([
        supabase
          .from("partidas")
          .select(
            "id, time_a_id, time_b_id, gols_a, gols_b, grupo, status, rodada",
          )
          .lte("rodada", 3),
        supabase.from("paises").select("id, nome, grupo, bandeira_url"),
      ]);

    if (eP) throw new Error(eP.message);
    if (ePaises) throw new Error(ePaises.message);

    const classificacao = calcularClassificacaoGrupos(
      partidas ?? [],
      paises ?? [],
    );
    const terceiros = rankearTerceirosLugares(classificacao);
    return NextResponse.json({ classificacao, terceiros });
  } catch (e) {
    return handleApiError(e);
  }
}
