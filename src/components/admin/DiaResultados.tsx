"use client";

import { useEffect, useRef } from "react";
import { ResultadoCard } from "@/components/admin/ResultadoCard";
import { ResultadoForm } from "@/components/admin/ResultadoForm";
import type { Partida } from "@/lib/types";

interface DiaResultadosProps {
  dia: string;
  isHoje: boolean;
  partidas: Partida[];
}

export function DiaResultados({ dia, isHoje, partidas }: DiaResultadosProps) {
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
        {partidas.map((partida) =>
          partida.status === "finalizado" ? (
            <ResultadoCard key={partida.id} partida={partida} />
          ) : (
            <ResultadoForm key={partida.id} partida={partida} />
          ),
        )}
      </div>
    </div>
  );
}
