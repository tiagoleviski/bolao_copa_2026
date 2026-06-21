import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchResultadosDia,
  resolverTimeId,
} from "@/lib/services/sync.service";
import { atualizarResultadoPartida } from "@/lib/services/partidas.service";

function isCronRequest(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${cronSecret}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!isCronRequest(req)) {
      await requireAdmin();
    }

    const supabase = createAdminClient();
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });

    const [resultados, { data: paises }, { data: partidas }] =
      await Promise.all([
        fetchResultadosDia(today),
        supabase.from("paises").select("id, nome, grupo, bandeira_url"),
        supabase
          .from("partidas")
          .select("id, time_a_id, time_b_id, status, gols_a, gols_b")
          .neq("status", "finalizado"),
      ]);

    if (!paises || !partidas) {
      return NextResponse.json({ synced: 0, skipped: 0, errors: [] });
    }

    let synced = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const resultado of resultados) {
      const homeId = resolverTimeId(resultado.homeTeam, paises);
      const awayId = resolverTimeId(resultado.awayTeam, paises);

      if (!homeId || !awayId) {
        errors.push(
          `Times não encontrados: "${resultado.homeTeam}" vs "${resultado.awayTeam}"`,
        );
        continue;
      }

      const partida = partidas.find(
        (p) =>
          (p.time_a_id === homeId && p.time_b_id === awayId) ||
          (p.time_a_id === awayId && p.time_b_id === homeId),
      );

      if (!partida) {
        skipped++;
        continue;
      }

      const golsA =
        partida.time_a_id === homeId
          ? resultado.homeGoals
          : resultado.awayGoals;
      const golsB =
        partida.time_a_id === homeId
          ? resultado.awayGoals
          : resultado.homeGoals;

      try {
        await atualizarResultadoPartida(partida.id, golsA, golsB);
        synced++;
      } catch (e) {
        errors.push(
          `Erro ao atualizar partida ${partida.id}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    // Os confrontos do mata-mata são definidos manualmente pelo admin,
    // não sincronizados automaticamente.

    return NextResponse.json({
      synced,
      skipped,
      errors,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
