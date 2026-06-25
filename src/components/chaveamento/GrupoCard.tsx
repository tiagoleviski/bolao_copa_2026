"use client";

import { toast } from "sonner";
import { FlagImage } from "@/components/shared/FlagImage";
import type { PrevisaoLocal } from "@/hooks/useChaveamento";
import type { Pais, PosicaoOficialGrupo } from "@/lib/types";
import {
  calcularPontoPrevisaoGrupo,
  type StatusPrevisaoGrupo,
} from "@/lib/scoring";

interface GrupoCardProps {
  grupo: string;
  paises: Pais[];
  previsoes: PrevisaoLocal[];
  prazoEncerrado: boolean;
  terceirosAvancando: number;
  posicoesOficiais: PosicaoOficialGrupo[];
  onToggle: (paisId: number, posicao: 1 | 2 | 3) => void;
}

const STATUS_BADGE: Record<StatusPrevisaoGrupo, string> = {
  exata: "bg-green-500/20 border-green-400/50 text-green-300",
  passou: "bg-sky-500/20 border-sky-400/50 text-sky-300",
  errou: "bg-red-500/15 border-red-400/40 text-red-300/80",
  pendente: "",
};

const POSICAO_LABELS = ["1°", "2°", "3°"] as const;
const POSICAO_CORES: Record<number, string> = {
  1: "bg-yellow-500/20 border-yellow-400 text-yellow-300",
  2: "bg-slate-500/20 border-slate-400 text-slate-300",
  3: "bg-orange-500/20 border-orange-400 text-orange-300",
};
// Gabarito: tonalidade forte para a posição em que o time REALMENTE passou.
const POSICAO_GABARITO: Record<number, string> = {
  1: "bg-yellow-400/70 border-yellow-200 text-yellow-950",
  2: "bg-slate-300/70 border-slate-100 text-slate-950",
  3: "bg-orange-400/70 border-orange-200 text-orange-950",
};
const POSICAO_INATIVO =
  "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30";

export function GrupoCard({
  grupo,
  paises,
  previsoes,
  prazoEncerrado,
  terceirosAvancando,
  posicoesOficiais,
  onToggle,
}: GrupoCardProps) {
  const previsaoPorPais = new Map(previsoes.map((p) => [p.pais_id, p]));
  const ocupadosPorPosicao = new Set(previsoes.map((p) => p.posicao));

  // ─── Pontos de grupo (só quando o resultado oficial já foi lançado) ─────────
  const idsDoGrupo = new Set(paises.map((p) => p.id));
  const oficiaisDoGrupo = posicoesOficiais.filter((o) =>
    idsDoGrupo.has(o.pais_id),
  );
  const grupoDecidido = oficiaisDoGrupo.length > 0;
  const oficialPorPais = new Map(oficiaisDoGrupo.map((o) => [o.pais_id, o]));

  const detalhePorPais = new Map(
    previsoes.map((p) => [
      p.pais_id,
      calcularPontoPrevisaoGrupo(p, oficialPorPais.get(p.pais_id), grupoDecidido),
    ]),
  );
  const subtotalGrupo = [...detalhePorPais.values()].reduce(
    (acc, d) => acc + d.pontos,
    0,
  );

  function handleClick(pais: Pais, posicao: 1 | 2 | 3) {
    if (prazoEncerrado) return;

    const atual = previsaoPorPais.get(pais.id);
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg text-white">GRUPO {grupo}</h3>
        {grupoDecidido && (
          <span className="text-xs font-bold rounded-full px-2 py-0.5 bg-purple-500/20 border border-purple-400/50 text-purple-200">
            +{subtotalGrupo} pts
          </span>
        )}
      </div>
      <div className="space-y-2">
        {paises.map((pais) => {
          const prev = previsaoPorPais.get(pais.id);
          const detalhe = prev ? detalhePorPais.get(pais.id) : undefined;
          // Gabarito: posição em que o time REALMENTE passou (se passou).
          const oficialDoPais = oficialPorPais.get(pais.id);
          const passou =
            !!oficialDoPais &&
            (oficialDoPais.posicao <= 2 ||
              (oficialDoPais.posicao === 3 && oficialDoPais.terceiro_avancou));
          const posicaoGabarito =
            grupoDecidido && passou ? oficialDoPais.posicao : null;
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
              {grupoDecidido && detalhe && detalhe.status !== "pendente" && (
                <span
                  className={`text-[10px] font-bold rounded px-1.5 py-0.5 border shrink-0 ${STATUS_BADGE[detalhe.status]}`}
                  title={
                    detalhe.status === "exata"
                      ? "Posição exata"
                      : detalhe.status === "passou"
                        ? "Time avançou (posição diferente)"
                        : "Não pontuou"
                  }
                >
                  {detalhe.pontos > 0 ? `+${detalhe.pontos}` : "0"}
                </span>
              )}
              <div className="flex gap-1 shrink-0">
                {([1, 2, 3] as const).map((pos) => {
                  const isPick = prev?.posicao === pos;
                  const isGabarito = posicaoGabarito === pos;
                  const acerto = isPick && isGabarito;
                  const estilo = acerto
                    ? `${POSICAO_GABARITO[pos]} ring-2 ring-green-400/80`
                    : isGabarito
                      ? POSICAO_GABARITO[pos]
                      : isPick
                        ? POSICAO_CORES[pos]
                        : `${POSICAO_INATIVO}${prazoEncerrado ? " opacity-60" : ""}`;
                  return (
                    <button
                      key={pos}
                      onClick={() => handleClick(pais, pos)}
                      disabled={prazoEncerrado}
                      title={
                        isGabarito
                          ? `Passou de fato em ${POSICAO_LABELS[pos - 1]}${acerto ? " — você acertou!" : ""}`
                          : undefined
                      }
                      className={`w-8 h-7 rounded text-xs font-bold border transition-all ${prazoEncerrado ? "cursor-not-allowed" : "cursor-pointer"} ${estilo}`}
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
