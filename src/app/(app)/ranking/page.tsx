import { createClient } from "@/lib/supabase/server";
import { calcularRanking } from "@/lib/scoring";
import { RankingTable } from "@/components/ranking/RankingTable";
import type {
  Aposta,
  ApostaArtilheiro,
  FaseClassificacao,
  Perfil,
  PrevisaoClassificacao,
} from "@/lib/types";

export const revalidate = 60;

export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: perfis },
    { data: apostas },
    { data: previsoes },
    { data: apostasArtilheiro },
    { data: artilheiroOficial },
    { data: partidas },
    { data: classificacaoOficialRaw },
  ] = await Promise.all([
    supabase.from("perfis").select("id, nome_completo, email"),
    supabase.from("apostas").select("*"),
    supabase.from("previsoes_classificacao").select("*"),
    supabase.from("apostas_artilheiro").select("*"),
    supabase
      .from("artilheiro_oficial")
      .select("jogador_id")
      .order("definido_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("partidas")
      .select("id, gols_a, gols_b, status")
      .eq("status", "finalizado"),
    supabase
      .from("classificacao_oficial")
      .select("pais_id, fase")
      .then(
        (res) => res,
        () => ({ data: null, error: null }),
      ),
  ]);

  // Build classification map from official results
  // For now derive it from match results (to be extended when admin sets it)
  const classificacaoOficial = new Map<number, FaseClassificacao[]>();
  if (classificacaoOficialRaw) {
    for (const row of classificacaoOficialRaw) {
      const fases = classificacaoOficial.get(row.pais_id) ?? [];
      fases.push(row.fase as FaseClassificacao);
      classificacaoOficial.set(row.pais_id, fases);
    }
  }

  const ranking = calcularRanking(
    (perfis ?? []) as Perfil[],
    (apostas ?? []) as Aposta[],
    (previsoes ?? []) as PrevisaoClassificacao[],
    classificacaoOficial,
    (apostasArtilheiro ?? []) as ApostaArtilheiro[],
    artilheiroOficial?.jogador_id ?? null,
  );

  const totalPartidas = (partidas ?? []).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl gradient-copa-text">RANKING</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {totalPartidas > 0
            ? `${totalPartidas} partida${totalPartidas !== 1 ? "s" : ""} finalizada${totalPartidas !== 1 ? "s" : ""}`
            : "O torneio ainda não começou"}
        </p>
      </div>

      {totalPartidas === 0 && (
        <div className="glass rounded-2xl p-8 text-center space-y-2">
          <p className="text-4xl">⏳</p>
          <p className="font-display text-2xl text-muted-foreground">
            EM BREVE
          </p>
          <p className="text-sm text-muted-foreground">
            A pontuação começa assim que as primeiras partidas forem finalizadas
          </p>
        </div>
      )}

      <RankingTable entries={ranking} userId={user!.id} />
    </div>
  );
}
