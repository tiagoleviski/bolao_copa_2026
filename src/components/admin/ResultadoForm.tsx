"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAtualizarResultado } from "@/hooks/useAdmin";
import { FlagImage } from "@/components/shared/FlagImage";
import { formatarDataHora } from "@/lib/time";
import type { Partida } from "@/lib/types";

interface ResultadoFormProps {
  partida: Partida;
}

export function ResultadoForm({ partida }: ResultadoFormProps) {
  const [golsA, setGolsA] = useState(partida.gols_a ?? "");
  const [golsB, setGolsB] = useState(partida.gols_b ?? "");
  const atualizarResultado = useAtualizarResultado();

  const nomeA = partida.time_a?.nome ?? partida.placeholder_time_a ?? "?";
  const nomeB = partida.time_b?.nome ?? partida.placeholder_time_b ?? "?";
  const finalizado = partida.status === "finalizado";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (golsA === "" || golsB === "") {
      toast.error("Preencha ambos os placares.");
      return;
    }
    atualizarResultado.mutate(
      { partidaId: partida.id, golsA: Number(golsA), golsB: Number(golsB) },
      {
        onSuccess: () =>
          toast.success("Resultado salvo e pontuação calculada!"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`glass rounded-xl p-4 space-y-3 ${finalizado ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatarDataHora(partida.data_hora)}</span>
        {finalizado && (
          <span className="text-green-400 font-medium">✓ Finalizado</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center justify-end gap-2">
          {partida.time_a?.bandeira_url && (
            <FlagImage
              src={partida.time_a.bandeira_url}
              alt={nomeA}
              size={28}
            />
          )}
          <span className="text-sm font-medium truncate">{nomeA}</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            type="number"
            min={0}
            max={99}
            value={golsA}
            onChange={(e) => setGolsA(e.target.value)}
            className="w-10 h-9 text-center font-bold rounded-lg bg-white/10 border border-white/20
              focus:border-purple-500 focus:outline-none text-sm
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            min={0}
            max={99}
            value={golsB}
            onChange={(e) => setGolsB(e.target.value)}
            className="w-10 h-9 text-center font-bold rounded-lg bg-white/10 border border-white/20
              focus:border-purple-500 focus:outline-none text-sm
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="flex flex-1 items-center gap-2">
          {partida.time_b?.bandeira_url && (
            <FlagImage
              src={partida.time_b.bandeira_url}
              alt={nomeB}
              size={28}
            />
          )}
          <span className="text-sm font-medium truncate">{nomeB}</span>
        </div>

        <button
          type="submit"
          disabled={atualizarResultado.isPending}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#004b87] text-white text-xs font-semibold cursor-pointer
            hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {atualizarResultado.isPending ? "..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
