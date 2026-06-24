"use client";

import { GRUPOS } from "@/lib/constants";
import { GrupoCardOficial, type PosicaoOficialLocal } from "./GrupoCardOficial";
export type { PosicaoOficialLocal };
import type { Pais } from "@/lib/types";

interface GruposPanelOficialProps {
  paises: Pais[];
  posicoes: PosicaoOficialLocal[];
  salvando: Set<number>;
  terceirosAvancando: number;
  onToggle: (paisId: number, posicao: 1 | 2 | 3) => void;
}

export function GruposPanelOficial({
  paises,
  posicoes,
  salvando,
  terceirosAvancando,
  onToggle,
}: GruposPanelOficialProps) {
  const paisePorGrupo = new Map<string, Pais[]>();
  for (const grupo of GRUPOS) {
    paisePorGrupo.set(
      grupo,
      paises.filter((p) => p.grupo === grupo),
    );
  }

  const posicoesPorGrupo = new Map<string, PosicaoOficialLocal[]>();
  for (const pos of posicoes) {
    const pais = paises.find((p) => p.id === pos.pais_id);
    if (!pais) continue;
    const lista = posicoesPorGrupo.get(pais.grupo) ?? [];
    lista.push(pos);
    posicoesPorGrupo.set(pais.grupo, lista);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {GRUPOS.map((grupo) => (
        <GrupoCardOficial
          key={grupo}
          grupo={grupo}
          paises={paisePorGrupo.get(grupo) ?? []}
          posicoes={posicoesPorGrupo.get(grupo) ?? []}
          salvando={salvando}
          terceirosAvancando={terceirosAvancando}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
