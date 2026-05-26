"use client";

import { toast } from "sonner";
import { useSalvarGrupo } from "@/hooks/useChaveamento";
import { FlagImage } from "@/components/shared/FlagImage";
import type { Pais, PrevisaoGrupo } from "@/lib/types";

interface GrupoCardProps {
  grupo: string;
  paises: Pais[];
  previsoes: PrevisaoGrupo[];
  prazoEncerrado: boolean;
  terceirosAvancando: number;
  onAlterado: () => void;
}

const POSICAO_LABELS = ["1°", "2°", "3°"] as const;
const POSICAO_CORES: Record<number, string> = {
  1: "bg-yellow-500/20 border-yellow-400 text-yellow-300",
  2: "bg-slate-500/20 border-slate-400 text-slate-300",
  3: "bg-orange-500/20 border-orange-400 text-orange-300",
};
const POSICAO_INATIVO =
  "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30";

export function GrupoCard({
  grupo,
  paises,
  previsoes,
  prazoEncerrado,
  terceirosAvancando,
  onAlterado,
}: GrupoCardProps) {
  const salvar = useSalvarGrupo();

  const previsaoPorPais = new Map(previsoes.map((p) => [p.pais_id, p]));
  const ocupadosPorPosicao = new Set(
    previsoes.filter((p) => p.posicao <= 3).map((p) => p.posicao),
  );

  function togglePosicao(pais: Pais, posicao: 1 | 2 | 3) {
    if (prazoEncerrado) return;

    const atual = previsaoPorPais.get(pais.id);
    const jaTem = atual?.posicao === posicao;

    if (jaTem) {
      salvar.mutate(
        { paisId: pais.id, posicao: null },
        {
          onSuccess: onAlterado,
          onError: (err) => toast.error(err.message),
        },
      );
      return;
    }

    if (!jaTem && ocupadosPorPosicao.has(posicao)) {
      toast.error(
        `Já há uma seleção marcada como ${posicao}° no Grupo ${grupo}.`,
      );
      return;
    }

    if (posicao === 3 && terceirosAvancando >= 8) {
      toast.error("Máximo de 8 terceiros colocados já selecionados.");
      return;
    }

    salvar.mutate(
      { paisId: pais.id, posicao, terceiroAvanca: posicao === 3 },
      {
        onSuccess: onAlterado,
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="font-display text-lg text-white mb-3">GRUPO {grupo}</h3>
      <div className="space-y-2">
        {paises.map((pais) => {
          const prev = previsaoPorPais.get(pais.id);
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
              </div>
              <div className="flex gap-1 shrink-0">
                {([1, 2, 3] as const).map((pos) => {
                  const ativo = prev?.posicao === pos;
                  return (
                    <button
                      key={pos}
                      onClick={() => togglePosicao(pais, pos)}
                      disabled={prazoEncerrado || salvar.isPending}
                      className={`w-8 h-7 rounded text-xs font-bold border transition-all cursor-pointer
                        ${ativo ? POSICAO_CORES[pos] : POSICAO_INATIVO}
                        ${prazoEncerrado ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {POSICAO_LABELS[pos - 1]}
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
