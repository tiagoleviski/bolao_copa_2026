"use client";

import { toast } from "sonner";
import { FlagImage } from "@/components/shared/FlagImage";
import type { Pais } from "@/lib/types";

export type PosicaoOficialLocal = {
  pais_id: number;
  posicao: 1 | 2 | 3;
  terceiro_avancou: boolean;
};

interface GrupoCardOficialProps {
  grupo: string;
  paises: Pais[];
  posicoes: PosicaoOficialLocal[];
  salvando: Set<number>;
  terceirosAvancando: number;
  onToggle: (paisId: number, posicao: 1 | 2 | 3) => void;
}

const POSICAO_CORES: Record<number, string> = {
  1: "bg-yellow-500/20 border-yellow-400 text-yellow-300",
  2: "bg-slate-500/20 border-slate-400 text-slate-300",
  3: "bg-orange-500/20 border-orange-400 text-orange-300",
};
const POSICAO_INATIVO =
  "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30";

export function GrupoCardOficial({
  grupo,
  paises,
  posicoes,
  salvando,
  terceirosAvancando,
  onToggle,
}: GrupoCardOficialProps) {
  const posicaoPorPais = new Map(posicoes.map((p) => [p.pais_id, p]));
  const ocupadosPorPosicao = new Set(posicoes.map((p) => p.posicao));

  function handleClick(pais: Pais, posicao: 1 | 2 | 3) {
    if (salvando.has(pais.id)) return;

    const atual = posicaoPorPais.get(pais.id);
    const jaTem = atual?.posicao === posicao;

    if (!jaTem && ocupadosPorPosicao.has(posicao)) {
      toast.error(
        `Já há uma seleção marcada como ${posicao}° no Grupo ${grupo}.`,
      );
      return;
    }

    if (!jaTem && posicao === 3 && terceirosAvancando >= 8) {
      toast.error("Máximo de 8 terceiros colocados já selecionados.");
      return;
    }

    onToggle(pais.id, posicao);
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-display text-lg text-white mb-3">GRUPO {grupo}</h3>
      <div className="space-y-2">
        {paises.map((pais) => {
          const pos = posicaoPorPais.get(pais.id);
          const isSalvando = salvando.has(pais.id);
          return (
            <div key={pais.id} className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {pais.bandeira_url && (
                  <FlagImage
                    src={pais.bandeira_url}
                    alt={pais.nome}
                    size={20}
                  />
                )}
                <span className="text-sm text-foreground truncate">
                  {pais.nome}
                </span>
                {isSalvando && (
                  <span className="text-xs text-muted-foreground animate-pulse">
                    …
                  </span>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                {([1, 2, 3] as const).map((p) => {
                  const ativo = pos?.posicao === p;
                  return (
                    <button
                      key={p}
                      onClick={() => handleClick(pais, p)}
                      disabled={isSalvando}
                      className={`w-8 h-7 rounded text-xs font-bold border transition-all cursor-pointer disabled:opacity-40
                        ${ativo ? POSICAO_CORES[p] : POSICAO_INATIVO}`}
                    >
                      {p}°
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
