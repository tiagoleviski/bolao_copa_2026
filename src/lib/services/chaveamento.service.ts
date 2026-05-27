import "server-only";

import { createClient } from "@/lib/supabase/server";
import { PRAZO_PREVISOES } from "@/lib/constants";
import type {
  FaseChaveamento,
  PosicaoOficialGrupo,
  PrevisaoChaveamento,
  PrevisaoGrupo,
  ResultadoChaveamentoOficial,
} from "@/lib/types";

export async function getChaveamentoData(userId: string) {
  const supabase = await createClient();

  const [paisesRes, gruposRes, chaveamentoRes] = await Promise.all([
    supabase.from("paises").select("*").order("grupo").order("nome"),
    supabase.from("previsao_grupo").select("*").eq("user_id", userId),
    supabase.from("previsao_chaveamento").select("*").eq("user_id", userId),
  ]);

  if (paisesRes.error) throw new Error(paisesRes.error.message);

  return {
    paises: paisesRes.data ?? [],
    previsoesGrupo: (gruposRes.data ?? []) as PrevisaoGrupo[],
    previsoesChaveamento: (chaveamentoRes.data ?? []) as PrevisaoChaveamento[],
  };
}

export async function salvarPrevisaoGrupo(
  userId: string,
  paisId: number,
  posicao: 1 | 2 | 3 | 4,
  terceiroAvanca: boolean,
) {
  if (new Date() > PRAZO_PREVISOES) throw new Error("Prazo encerrado.");

  const supabase = await createClient();
  const { error } = await supabase.from("previsao_grupo").upsert(
    {
      user_id: userId,
      pais_id: paisId,
      posicao,
      terceiro_avanca: terceiroAvanca,
    },
    { onConflict: "user_id,pais_id" },
  );
  if (error) throw new Error(error.message);
}

export async function removerPrevisaoGrupo(userId: string, paisId: number) {
  if (new Date() > PRAZO_PREVISOES) throw new Error("Prazo encerrado.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("previsao_grupo")
    .delete()
    .eq("user_id", userId)
    .eq("pais_id", paisId);
  if (error) throw new Error(error.message);
}

export async function salvarPrevisoesGrupo(
  userId: string,
  previsoes: Array<{
    pais_id: number;
    posicao: 1 | 2 | 3;
    terceiro_avanca: boolean;
  }>,
) {
  if (new Date() > PRAZO_PREVISOES) throw new Error("Prazo encerrado.");

  const supabase = await createClient();

  const { error: delError } = await supabase
    .from("previsao_grupo")
    .delete()
    .eq("user_id", userId);
  if (delError) throw new Error(delError.message);

  if (previsoes.length === 0) return;

  const { error } = await supabase.from("previsao_grupo").insert(
    previsoes.map((p) => ({
      user_id: userId,
      pais_id: p.pais_id,
      posicao: p.posicao,
      terceiro_avanca: p.terceiro_avanca,
    })),
  );
  if (error) throw new Error(error.message);
}

export async function salvarPrevisaoSlot(
  userId: string,
  fase: FaseChaveamento,
  slot: number,
  paisId: number | null,
) {
  if (new Date() > PRAZO_PREVISOES) throw new Error("Prazo encerrado.");

  const supabase = await createClient();

  if (paisId === null) {
    const { error } = await supabase
      .from("previsao_chaveamento")
      .delete()
      .eq("user_id", userId)
      .eq("fase", fase)
      .eq("slot", slot);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from("previsao_chaveamento")
    .upsert(
      { user_id: userId, fase, slot, pais_id: paisId },
      { onConflict: "user_id,fase,slot" },
    );
  if (error) throw new Error(error.message);
}

export async function limparChaveamento(userId: string) {
  if (new Date() > PRAZO_PREVISOES) throw new Error("Prazo encerrado.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("previsao_chaveamento")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ─── Dados oficiais para scoring ─────────────────────────────────────────────

export async function getResultadosOficiais() {
  const supabase = await createClient();

  const [posGrupoRes, chaveamentoRes] = await Promise.all([
    supabase.from("posicao_oficial_grupo").select("*"),
    supabase.from("resultado_chaveamento_oficial").select("*"),
  ]);

  return {
    posicoesOficiais: (posGrupoRes.data ?? []) as PosicaoOficialGrupo[],
    resultadosChaveamento: (chaveamentoRes.data ??
      []) as ResultadoChaveamentoOficial[],
  };
}
