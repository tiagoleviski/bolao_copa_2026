import { PartidaCard } from "./PartidaCard";
import type { Aposta, Partida } from "@/lib/types";

interface DiaSectionProps {
  dia: string;
  partidas: Partida[];
  apostasMap: Map<number, Aposta>;
}

export function DiaSection({ dia, partidas, apostasMap }: DiaSectionProps) {
  return (
    <div className="space-y-2">
      <h2 className="font-display text-xl text-foreground/50 uppercase tracking-wider px-1">
        {dia}
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
