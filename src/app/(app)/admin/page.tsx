import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RODADA_LABELS } from "@/lib/constants";
import { ResultadoForm } from "@/components/admin/ResultadoForm";
import type { Partida } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();

  if (perfil?.role !== "admin") {
    redirect("/palpites");
  }

  const { data: partidas } = await supabase
    .from("partidas")
    .select(
      "*, time_a:time_a_id(id,nome,bandeira_url), time_b:time_b_id(id,nome,bandeira_url)",
    )
    .order("data_hora");

  const porRodada = new Map<number, Partida[]>();
  for (const p of partidas ?? []) {
    const rodada = p.rodada ?? 1;
    const lista = porRodada.get(rodada) ?? [];
    lista.push(p as Partida);
    porRodada.set(rodada, lista);
  }

  const rodadas = Array.from(porRodada.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl gradient-copa-text">ADMIN</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Insira os resultados oficiais das partidas
        </p>
      </div>

      {rodadas.map((rodada) => (
        <div key={rodada} className="space-y-3">
          <h2 className="font-display text-2xl text-foreground/80">
            {RODADA_LABELS[rodada] ?? `Rodada ${rodada}`}
          </h2>
          <div className="space-y-2">
            {porRodada.get(rodada)!.map((partida) => (
              <ResultadoForm key={partida.id} partida={partida} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
