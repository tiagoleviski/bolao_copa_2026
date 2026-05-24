"use client";

import { useAdminPartidas } from "@/hooks/useAdmin";
import { ResultadoForm } from "@/components/admin/ResultadoForm";
import { RODADA_LABELS } from "@/lib/constants";
import type { Partida } from "@/lib/types";

export default function AdminPage() {
  const { data: partidas, isPending } = useAdminPartidas();

  if (isPending) return null;

  const porRodada = new Map<number, Partida[]>();
  for (const p of partidas ?? []) {
    const rodada = p.rodada ?? 1;
    const lista = porRodada.get(rodada) ?? [];
    lista.push(p);
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
