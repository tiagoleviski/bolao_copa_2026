"use client";

import { usePalpites } from "@/hooks/usePalpites";
import { RodadaSection } from "@/components/palpites/RodadaSection";
import type { Partida } from "@/lib/types";

export default function PalpitesPage() {
  const { data, isPending } = usePalpites();

  if (isPending) return null;

  const { partidas, apostasMap } = data!;

  const porRodada = new Map<number, Partida[]>();
  for (const p of partidas) {
    const rodada = p.rodada ?? 1;
    const lista = porRodada.get(rodada) ?? [];
    lista.push(p);
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
