"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSalvarPrevisaoFase } from "@/hooks/usePrevisoes";
import { FlagImage } from "@/components/shared/FlagImage";
import type { FaseClassificacao, Pais } from "@/lib/types";

interface FasePanelProps {
  fase: FaseClassificacao;
  limite: number;
  cor: string;
  paisesElegiveis: Pais[];
  selecionados: number[];
  prazoEncerrado: boolean;
}

export function FasePanel({
  fase,
  limite,
  cor,
  paisesElegiveis,
  selecionados: initialSelecionados,
  prazoEncerrado,
}: FasePanelProps) {
  const [selecionados, setSelecionados] =
    useState<number[]>(initialSelecionados);
  const salvarFase = useSalvarPrevisaoFase();

  function toggle(paisId: number) {
    if (prazoEncerrado) return;

    const jaEsta = selecionados.includes(paisId);
    let novos: number[];

    if (jaEsta) {
      novos = selecionados.filter((id) => id !== paisId);
    } else {
      if (selecionados.length >= limite) {
        toast.error(`Máximo de ${limite} seleções para ${fase}.`);
        return;
      }
      novos = [...selecionados, paisId];
    }

    setSelecionados(novos);
    salvarFase.mutate(
      { fase, paisIds: novos },
      {
        onError: (err) => {
          toast.error(err.message);
          setSelecionados(initialSelecionados);
        },
      },
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className={`font-display text-2xl ${cor}`}>{fase.toUpperCase()}</h3>
        <span className="text-sm text-muted-foreground">
          {selecionados.length}/{limite}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {paisesElegiveis.map((pais) => {
          const selecionado = selecionados.includes(pais.id);
          return (
            <button
              key={pais.id}
              onClick={() => toggle(pais.id)}
              disabled={prazoEncerrado || salvarFase.isPending}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all border
                ${
                  selecionado
                    ? "bg-purple-600/30 border-purple-500 text-foreground"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
                }
                ${prazoEncerrado ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              {pais.bandeira_url && (
                <FlagImage src={pais.bandeira_url} alt={pais.nome} size={24} />
              )}
              <span className="truncate">{pais.nome}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
