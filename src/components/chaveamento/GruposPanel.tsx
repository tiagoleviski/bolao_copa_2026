"use client";

import { GRUPOS } from "@/lib/constants";
import { GrupoCard } from "./GrupoCard";
import type { PrevisaoLocal } from "@/hooks/useChaveamento";
import type { Pais } from "@/lib/types";

interface GruposPanelProps {
  paises: Pais[];
  previsoes: PrevisaoLocal[];
  prazoEncerrado: boolean;
  terceirosAvancando: number;
  onToggle: (paisId: number, posicao: 1 | 2 | 3) => void;
}

export function GruposPanel({
  paises,
  previsoes,
  prazoEncerrado,
  terceirosAvancando,
  onToggle,
}: GruposPanelProps) {
  const paisePorGrupo = new Map<string, Pais[]>();
  for (const grupo of GRUPOS) {
    paisePorGrupo.set(
      grupo,
      paises.filter((p) => p.grupo === grupo),
    );
  }

  const previsoesPorGrupo = new Map<string, PrevisaoLocal[]>();
  for (const prev of previsoes) {
    const pais = paises.find((p) => p.id === prev.pais_id);
    if (!pais) continue;
    const lista = previsoesPorGrupo.get(pais.grupo) ?? [];
    lista.push(prev);
    previsoesPorGrupo.set(pais.grupo, lista);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {GRUPOS.map((grupo) => (
        <GrupoCard
          key={grupo}
          grupo={grupo}
          paises={paisePorGrupo.get(grupo) ?? []}
          previsoes={previsoesPorGrupo.get(grupo) ?? []}
          prazoEncerrado={prazoEncerrado}
          terceirosAvancando={terceirosAvancando}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
