"use client";

import { usePrevisoes } from "@/hooks/usePrevisoes";
import { FasePanel } from "@/components/previsoes/FasePanel";
import { PosicaoFinalSelect } from "@/components/previsoes/PosicaoFinalSelect";
import { FASES_CONFIG, FASES_ORDEM, PRAZO_PREVISOES } from "@/lib/constants";
import type { FaseClassificacao, Pais } from "@/lib/types";

const FASES_MULTISELECT: FaseClassificacao[] = [
  "Segunda Fase",
  "Oitavas de Final",
  "Quartas de Final",
  "Semifinal",
];

const FASES_POSICAO: FaseClassificacao[] = [
  "Campeão",
  "Vice-Campeão",
  "3º Lugar",
  "4º Lugar",
];

export default function PrevisoesPage() {
  const { data, isPending } = usePrevisoes();

  if (isPending) return null;

  const { paises, previsoes } = data!;
  const prazoEncerrado = new Date() > PRAZO_PREVISOES;

  const selecionadosPorFase = new Map<FaseClassificacao, number[]>();
  for (const fase of FASES_ORDEM) {
    selecionadosPorFase.set(
      fase,
      previsoes.filter((p) => p.fase === fase).map((p) => p.pais_id),
    );
  }

  function elegiveisParaFase(fase: FaseClassificacao): Pais[] {
    const idx = FASES_ORDEM.indexOf(fase);
    if (idx === 0) return paises;
    const faseAnterior = FASES_ORDEM[idx - 1];
    const idsAnterior = selecionadosPorFase.get(faseAnterior) ?? [];
    return paises.filter((p) => idsAnterior.includes(p.id));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-white">PREVISÕES</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selecione quais seleções você prevê que avançarão em cada fase
        </p>
        {prazoEncerrado && (
          <p className="text-red-400 text-sm mt-2">
            ⏱ Prazo encerrado — previsões bloqueadas
          </p>
        )}
      </div>

      <div className="space-y-8">
        {FASES_MULTISELECT.map((fase) => {
          const config = FASES_CONFIG[fase];
          const elegiveis = elegiveisParaFase(fase);
          const selecionados = selecionadosPorFase.get(fase) ?? [];
          return (
            <div key={fase} className="glass rounded-2xl p-4 sm:p-6">
              <FasePanel
                fase={fase}
                limite={config.limite}
                cor={config.cor}
                paisesElegiveis={elegiveis}
                selecionados={selecionados}
                prazoEncerrado={prazoEncerrado}
              />
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="font-display text-3xl text-white mb-4">
          POSIÇÕES FINAIS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FASES_POSICAO.map((fase) => {
            const config = FASES_CONFIG[fase];
            const opcoes = elegiveisParaFase(fase);
            const ids = selecionadosPorFase.get(fase) ?? [];
            return (
              <PosicaoFinalSelect
                key={fase}
                fase={fase}
                cor={config.cor}
                opcoes={opcoes}
                selecionado={ids[0] ?? null}
                prazoEncerrado={prazoEncerrado}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
