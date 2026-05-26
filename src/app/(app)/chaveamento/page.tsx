"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useChaveamento, useLimparChaveamento } from "@/hooks/useChaveamento";
import { GruposPanel } from "@/components/chaveamento/GruposPanel";
import { Bracket } from "@/components/chaveamento/Bracket";
import { PRAZO_PREVISOES } from "@/lib/constants";

export default function ChaveamentoPage() {
  const { data, isPending } = useChaveamento();
  const limpar = useLimparChaveamento();
  const [abaAtiva, setAbaAtiva] = useState<"grupos" | "chaveamento">("grupos");

  if (isPending) return null;

  const { paises, previsoesGrupo, previsoesChaveamento } = data!;
  const prazoEncerrado = new Date() > PRAZO_PREVISOES;

  const totalGruposPreenchidos = (() => {
    const gruposOk = new Set<string>();
    for (const prev of previsoesGrupo) {
      const pais = paises.find((p) => p.id === prev.pais_id);
      if (pais && prev.posicao <= 3) gruposOk.add(pais.grupo);
    }
    return gruposOk.size;
  })();

  const terceirosAvancando = previsoesGrupo.filter(
    (p) => p.posicao === 3 && p.terceiro_avanca,
  ).length;

  const gruposCompletos =
    totalGruposPreenchidos === 12 && terceirosAvancando === 8;

  function handleGrupoAlterado() {
    if (previsoesChaveamento.length > 0) {
      limpar.mutate(undefined, {
        onSuccess: () =>
          toast.info(
            "Previsões do chaveamento limpas — as classificações dos grupos mudaram.",
          ),
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">CHAVEAMENTO</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Preencha os grupos e monte seu bracket para a Copa 2026
        </p>
        {prazoEncerrado && (
          <p className="text-red-400 text-sm mt-2">
            ⏱ Prazo encerrado — previsões bloqueadas
          </p>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setAbaAtiva("grupos")}
          className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px
            ${abaAtiva === "grupos" ? "border-purple-400 text-white" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          Fase de Grupos
          <span
            className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
              gruposCompletos
                ? "bg-green-600/30 text-green-400"
                : "bg-white/10 text-muted-foreground"
            }`}
          >
            {totalGruposPreenchidos}/12
          </span>
        </button>
        <button
          onClick={() => setAbaAtiva("chaveamento")}
          className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px
            ${abaAtiva === "chaveamento" ? "border-purple-400 text-white" : "border-transparent text-muted-foreground hover:text-white"}`}
        >
          Bracket
          {!gruposCompletos && (
            <span className="ml-2 text-xs text-yellow-500">
              complete os grupos primeiro
            </span>
          )}
        </button>
      </div>

      {/* Aba: Grupos */}
      {abaAtiva === "grupos" && (
        <div className="space-y-6">
          <GruposPanel
            paises={paises}
            previsoes={previsoesGrupo}
            prazoEncerrado={prazoEncerrado}
            terceirosAvancando={terceirosAvancando}
            onAlterado={handleGrupoAlterado}
          />

          {gruposCompletos && (
            <button
              onClick={() => setAbaAtiva("chaveamento")}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors cursor-pointer"
            >
              Montar o Bracket →
            </button>
          )}
        </div>
      )}

      {/* Aba: Bracket */}
      {abaAtiva === "chaveamento" && (
        <div className="space-y-4">
          {!gruposCompletos && (
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-sm text-yellow-300">
              Preencha todos os grupos e selecione os 8 melhores terceiros para
              que os times apareçam no bracket.
            </div>
          )}
          <div className="glass rounded-2xl p-4">
            <Bracket
              paises={paises}
              previsoesGrupo={previsoesGrupo}
              previsoesChaveamento={previsoesChaveamento}
              prazoEncerrado={prazoEncerrado}
            />
          </div>
        </div>
      )}
    </div>
  );
}
