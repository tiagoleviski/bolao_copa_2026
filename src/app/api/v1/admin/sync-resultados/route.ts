import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchResultadosDia,
  fetchConfrontosMataMata,
  resolverTimeId,
  API_STAGE_TO_RODADA,
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

    // --- Fase 2: Sync de confrontos do mata-mata ---
    let teamsAssigned = 0;
    const teamErrors: string[] = [];

    try {
      const knockoutMatches = await fetchConfrontosMataMata();

      if (knockoutMatches.length > 0) {
        const { data: knockoutPartidas } = await supabase
          .from("partidas")
          .select("id, time_a_id, time_b_id, data_hora, rodada")
          .gte("rodada", 4)
          .or("time_a_id.is.null,time_b_id.is.null");

        if (knockoutPartidas && knockoutPartidas.length > 0) {
          for (const apiMatch of knockoutMatches) {
            const rodada = API_STAGE_TO_RODADA[apiMatch.stage];
            if (!rodada) continue;

            const apiTime = new Date(apiMatch.utcDate).getTime();
            const partida = knockoutPartidas.find(
              (p) =>
                p.rodada === rodada &&
                new Date(p.data_hora).getTime() === apiTime,
            );

            if (!partida) {
              teamErrors.push(
                `Partida não encontrada: ${apiMatch.stage} em ${apiMatch.utcDate}`,
              );
              continue;
            }

            if (partida.time_a_id && partida.time_b_id) continue;

            const homeId = resolverTimeId(apiMatch.homeTeam, paises!);
            const awayId = resolverTimeId(apiMatch.awayTeam, paises!);

            if (!homeId || !awayId) {
              teamErrors.push(
                `Times não resolvidos (mata-mata): "${apiMatch.homeTeam}" vs "${apiMatch.awayTeam}"`,
              );
              continue;
            }

            const { error: updateErr } = await supabase
              .from("partidas")
              .update({ time_a_id: homeId, time_b_id: awayId })
              .eq("id", partida.id);

            if (updateErr) {
              teamErrors.push(
                `Erro ao atribuir times à partida ${partida.id}: ${updateErr.message}`,
              );
            } else {
              teamsAssigned++;
            }
          }
        }
      }
    } catch (e) {
      teamErrors.push(
        `Erro ao buscar confrontos: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return NextResponse.json({
      synced,
      skipped,
      errors,
      teamsAssigned,
      teamErrors,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
