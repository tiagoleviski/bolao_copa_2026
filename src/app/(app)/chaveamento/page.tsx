"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useChaveamento,
  useSalvarGrupos,
  type PrevisaoLocal,
} from "@/hooks/useChaveamento";
import { GruposPanel } from "@/components/chaveamento/GruposPanel";
import { PodioPanel } from "@/components/chaveamento/PodioPanel";
import { GRUPOS, PRAZO_PREVISOES } from "@/lib/constants";

export default function ChaveamentoPage() {
  const { data, isPending } = useChaveamento();
  const salvar = useSalvarGrupos();

  const [previsoes, setPrevisoes] = useState<PrevisaoLocal[]>([]);
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    if (data && !inicializado) {
      setPrevisoes(
        data.previsoesGrupo
          .filter((p) => p.posicao >= 1 && p.posicao <= 3)
          .map((p) => ({
            pais_id: p.pais_id,
            posicao: p.posicao as 1 | 2 | 3,
            terceiro_avanca: p.terceiro_avanca,
          })),
      );
      setInicializado(true);
    }
  }, [data, inicializado]);

  if (isPending || !data) return null;

  const { paises } = data;
  const prazoEncerrado = new Date() > PRAZO_PREVISOES;

  // ─── Métricas derivadas ───────────────────────────────────────────────────

  const terceirosAvancando = previsoes.filter((p) => p.posicao === 3).length;

  const gruposCompletos = (() => {
    const primeiros = new Set<string>();
    const segundos = new Set<string>();
    for (const prev of previsoes) {
      const pais = paises.find((p) => p.id === prev.pais_id);
      if (!pais) continue;
      if (prev.posicao === 1) primeiros.add(pais.grupo);
      if (prev.posicao === 2) segundos.add(pais.grupo);
    }
    return (
      primeiros.size === GRUPOS.length &&
      segundos.size === GRUPOS.length &&
      terceirosAvancando === 8
    );
  })();

  const gruposComPrimeiroESegundo = (() => {
    const primeiros = new Set<string>();
    const segundos = new Set<string>();
    for (const prev of previsoes) {
      const pais = paises.find((p) => p.id === prev.pais_id);
      if (!pais) continue;
      if (prev.posicao === 1) primeiros.add(pais.grupo);
      if (prev.posicao === 2) segundos.add(pais.grupo);
    }
    return GRUPOS.filter((g) => primeiros.has(g) && segundos.has(g)).length;
  })();

  // ─── Toggle de posição (estado local, sem API) ────────────────────────────

  function handleToggle(paisId: number, posicao: 1 | 2 | 3) {
    const atual = previsoes.find((p) => p.pais_id === paisId);

    if (atual?.posicao === posicao) {
      setPrevisoes((prev) => prev.filter((p) => p.pais_id !== paisId));
      return;
    }

    setPrevisoes((prev) => {
      const semAtual = prev.filter((p) => p.pais_id !== paisId);
      return [
        ...semAtual,
        { pais_id: paisId, posicao, terceiro_avanca: posicao === 3 },
      ];
    });
  }

  // ─── Salvar (única chamada à API) ─────────────────────────────────────────

  function handleSalvar() {
    salvar.mutate(previsoes, {
      onSuccess: () => toast.success("Previsões salvas!"),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">CHAVEAMENTO</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Preencha a classificação de cada grupo. Selecione 8 terceiros
          colocados
        </p>
        {prazoEncerrado && (
          <p className="text-red-400 text-sm mt-2">
            ⏱ Prazo encerrado — previsões bloqueadas
          </p>
        )}
      </div>

      {/* Progresso */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          Grupos com 1° e 2°:
          <span
            className={`ml-1 font-bold ${gruposComPrimeiroESegundo === 12 ? "text-green-400" : "text-white"}`}
          >
            {gruposComPrimeiroESegundo}/12
          </span>
        </span>
        <span className="text-white/20">·</span>
        <span className="text-muted-foreground">
          Terceiros:
          <span
            className={`ml-1 font-bold ${terceirosAvancando === 8 ? "text-green-400" : "text-white"}`}
          >
            {terceirosAvancando}/8
          </span>
        </span>
      </div>

      <PodioPanel prazoEncerrado={prazoEncerrado} />

      <GruposPanel
        paises={paises}
        previsoes={previsoes}
        prazoEncerrado={prazoEncerrado}
        terceirosAvancando={terceirosAvancando}
        onToggle={handleToggle}
      />

      {!prazoEncerrado && (
        <button
          onClick={handleSalvar}
          disabled={!gruposCompletos || salvar.isPending}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors cursor-pointer"
        >
          {salvar.isPending ? "Salvando…" : "Salvar previsões"}
        </button>
      )}
    </div>
  );
}
