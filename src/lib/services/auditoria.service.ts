import "server-only";

import { createClient } from "@/lib/supabase/server";
import { apostaAberta } from "@/lib/time";
import { PRAZO_PREVISOES } from "@/lib/constants";

export async function getAuditoriaData() {
  const supabase = await createClient();
  const prazoPrevisoesEncerrado = new Date() >= PRAZO_PREVISOES;

  const [
    { data: perfis },
    { data: partidas },
    { data: apostas },
    ...restoCondicional
  ] = await Promise.all([
    supabase.from("perfis").select("id, nome_completo"),
    supabase
      .from("partidas")
      .select(
        "*, time_a:time_a_id(id,nome,bandeira_url,grupo), time_b:time_b_id(id,nome,bandeira_url,grupo)",
      )
      .order("data_hora"),
    supabase
      .from("apostas")
      .select("user_id, partida_id, gols_time_a, gols_time_b"),
    ...(prazoPrevisoesEncerrado
      ? [
          supabase
            .from("aposta_podio")
            .select(
              "user_id, posicao, pais_id, pais:pais_id(id, nome, bandeira_url)",
            )
            .then(
              (res) => res,
              () => ({ data: null, error: null }),
            ),
          supabase
            .from("previsao_grupo")
            .select(
              "user_id, pais_id, posicao, terceiro_avanca, pais:pais_id(id, nome, bandeira_url, grupo)",
            )
            .then(
              (res) => res,
              () => ({ data: null, error: null }),
            ),
          supabase
            .from("apostas_artilheiro")
            .select(
              "user_id, jogador_id, jogador:jogador_id(id, nome, pais:paises(id, nome, bandeira_url))",
            )
            .then(
              (res) => res,
              () => ({ data: null, error: null }),
            ),
        ]
      : [
          Promise.resolve({ data: null, error: null }),
          Promise.resolve({ data: null, error: null }),
          Promise.resolve({ data: null, error: null }),
        ]),
  ]);

  const [podioRes, gruposRes, artilheiroRes] = restoCondicional;

  const partidasFechadas = (partidas ?? []).filter(
    (p) => !apostaAberta(p.data_hora),
  );

  const apostasPorPartida = new Map<number, typeof apostas>();
  for (const a of apostas ?? []) {
    if (!apostasPorPartida.has(a.partida_id)) {
      apostasPorPartida.set(a.partida_id, []);
    }
    apostasPorPartida.get(a.partida_id)!.push(a);
  }

  const palpites = partidasFechadas.map((partida) => ({
    partida,
    apostas: apostasPorPartida.get(partida.id) ?? [],
  }));

  return {
    perfis: perfis ?? [],
    palpites,
    podio: prazoPrevisoesEncerrado
      ? ((podioRes as { data: unknown }).data ?? [])
      : null,
    grupos: prazoPrevisoesEncerrado
      ? ((gruposRes as { data: unknown }).data ?? [])
      : null,
    artilheiro: prazoPrevisoesEncerrado
      ? ((artilheiroRes as { data: unknown }).data ?? [])
      : null,
    prazoPrevisoesEncerrado,
  };
}
