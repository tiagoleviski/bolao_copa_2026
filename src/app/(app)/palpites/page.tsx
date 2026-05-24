import { createClient } from "@/lib/supabase/server";
import { RodadaSection } from "@/components/palpites/RodadaSection";
import type { Aposta, Partida } from "@/lib/types";

export default async function PalpitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: partidas }, { data: apostas }] = await Promise.all([
    supabase
      .from("partidas")
      .select(
        "*, time_a:time_a_id(id,nome,bandeira_url,grupo), time_b:time_b_id(id,nome,bandeira_url,grupo)",
      )
      .order("data_hora"),
    supabase.from("apostas").select("*").eq("user_id", user!.id),
  ]);

  const apostasMap = new Map<number, Aposta>(
    (apostas ?? []).map((a) => [a.partida_id, a as Aposta]),
  );

  const porRodada = new Map<number, Partida[]>();
  for (const p of partidas ?? []) {
    const rodada = p.rodada ?? 1;
    const lista = porRodada.get(rodada) ?? [];
    lista.push(p as Partida);
    porRodada.set(rodada, lista);
  }

  const rodadasOrdenadas = Array.from(porRodada.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl gradient-copa-text">
          MEUS PALPITES
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Insira o placar que você prevê para cada partida
        </p>
      </div>

      {rodadasOrdenadas.map((rodada) => (
        <RodadaSection
          key={rodada}
          rodada={rodada}
          partidas={porRodada.get(rodada)!}
          apostasMap={apostasMap}
        />
      ))}

      {rodadasOrdenadas.length === 0 && (
        <p className="text-muted-foreground text-center py-16">
          Nenhuma partida cadastrada.
        </p>
      )}
    </div>
  );
}
