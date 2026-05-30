"use client";

import { useEffect, useRef } from "react";
import { PartidaCard } from "./PartidaCard";
import type { Aposta, Partida } from "@/lib/types";

interface DiaSectionProps {
  dia: string;
  partidas: Partida[];
  apostasMap: Map<number, Aposta>;
  isHoje?: boolean;
  forceClosed?: boolean;
}

export function DiaSection({
  dia,
  partidas,
  apostasMap,
  isHoje,
  forceClosed,
}: DiaSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHoje && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isHoje]);

  return (
    <div ref={ref} className="space-y-2">
      <h2 className="font-display text-xl text-foreground/50 uppercase tracking-wider px-1">
        {dia}
      </h2>
      <div className="space-y-2">
        {partidas.map((partida) => (
          <PartidaCard
            key={partida.id}
            partida={partida}
            aposta={apostasMap.get(partida.id) ?? null}
            forceClosed={forceClosed}
          />
        ))}
      </div>
    </div>
  );
}
