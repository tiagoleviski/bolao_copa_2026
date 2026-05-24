import { RODADA_LABELS } from "@/lib/constants";
import { PartidaCard } from "./PartidaCard";
import type { Aposta, Partida } from "@/lib/types";

interface RodadaSectionProps {
  rodada: number;
  partidas: Partida[];
  apostasMap: Map<number, Aposta>;
}

export function RodadaSection({
  rodada,
  partidas,
  apostasMap,
}: RodadaSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-2xl text-foreground/80 px-1">
        {RODADA_LABELS[rodada] ?? `Rodada ${rodada}`}
      </h2>
      <div className="space-y-2">
        {partidas.map((partida) => (
          <PartidaCard
            key={partida.id}
            partida={partida}
            aposta={apostasMap.get(partida.id) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
