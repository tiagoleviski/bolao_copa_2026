"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { salvarPosicaoEspecifica } from "@/actions/previsoes";
import { FlagImage } from "@/components/shared/FlagImage";
import type { FaseClassificacao, Pais } from "@/lib/types";

interface PosicaoFinalSelectProps {
  fase: FaseClassificacao;
  cor: string;
  opcoes: Pais[];
  selecionado: number | null;
  prazoEncerrado: boolean;
}

export function PosicaoFinalSelect({
  fase,
  cor,
  opcoes,
  selecionado: initialSelecionado,
  prazoEncerrado,
}: PosicaoFinalSelectProps) {
  const [selecionado, setSelecionado] = useState<number | null>(
    initialSelecionado,
  );
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (prazoEncerrado) return;
    const paisId = e.target.value ? Number(e.target.value) : null;
    setSelecionado(paisId);

    startTransition(async () => {
      const result = await salvarPosicaoEspecifica(fase, paisId);
      if (result.error) {
        toast.error(result.error);
        setSelecionado(initialSelecionado);
      }
    });
  }

  const paisSelecionado = opcoes.find((p) => p.id === selecionado);

  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className={`font-display text-xl ${cor}`}>{fase.toUpperCase()}</h3>
        {isPending && (
          <span className="text-xs text-muted-foreground">Salvando...</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {paisSelecionado?.bandeira_url && (
          <FlagImage
            src={paisSelecionado.bandeira_url}
            alt={paisSelecionado.nome}
            size={32}
          />
        )}
        <select
          value={selecionado ?? ""}
          onChange={handleChange}
          disabled={prazoEncerrado || isPending}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground
            focus:border-purple-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">— Selecione —</option>
          {opcoes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
