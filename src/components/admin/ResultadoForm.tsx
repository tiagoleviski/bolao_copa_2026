"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAtualizarResultado,
  useAtualizarTimes,
  useAdminPaises,
} from "@/hooks/useAdmin";
import { FlagImage } from "@/components/shared/FlagImage";
import { formatarDataHora } from "@/lib/time";
import type { Pais, Partida } from "@/lib/types";

interface ResultadoFormProps {
  partida: Partida;
}

interface TimeSelectProps {
  partida: Partida;
  lado: "a" | "b";
  paises: Pais[];
  align: "left" | "right";
}

function TimeSelect({ partida, lado, paises, align }: TimeSelectProps) {
  const timeIdAtual = lado === "a" ? partida.time_a_id : partida.time_b_id;
  const placeholder =
    lado === "a" ? partida.placeholder_time_a : partida.placeholder_time_b;
  const [timeId, setTimeId] = useState<number | null>(timeIdAtual ?? null);
  const [aberto, setAberto] = useState(false);
  const atualizarTimes = useAtualizarTimes();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function onClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", onClickFora);
    return () => document.removeEventListener("mousedown", onClickFora);
  }, [aberto]);

  const paisSelecionado = paises.find((p) => p.id === timeId);

  function selecionar(novoId: number) {
    setAberto(false);
    if (novoId === timeId) return;
    setTimeId(novoId);
    atualizarTimes.mutate(
      {
        partidaId: partida.id,
        timeAId: lado === "a" ? novoId : (partida.time_b_id ?? null),
        timeBId: lado === "b" ? novoId : (partida.time_a_id ?? null),
      },
      {
        onSuccess: () => toast.success("Confronto atualizado!"),
        onError: (err) => {
          toast.error(err.message);
          setTimeId(timeIdAtual ?? null);
        },
      },
    );
  }

  return (
    <div ref={ref} className="relative flex-1 min-w-0 space-y-1">
      {placeholder && (
        <p
          className={`text-[11px] text-muted-foreground truncate px-1 ${align === "right" ? "text-right" : ""}`}
        >
          {placeholder}
        </p>
      )}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        disabled={atualizarTimes.isPending}
        className="w-full h-9 flex items-center gap-2 rounded-lg bg-white/10 border border-white/20
          hover:border-white/40 focus:border-purple-500 focus:outline-none px-2.5 text-sm
          disabled:opacity-50 cursor-pointer"
      >
        {paisSelecionado?.bandeira_url && (
          <FlagImage src={paisSelecionado.bandeira_url} alt="" size={22} />
        )}
        <span
          className={`truncate ${paisSelecionado ? "text-foreground font-medium" : "text-muted-foreground"}`}
        >
          {paisSelecionado?.nome ?? "Selecionar…"}
        </span>
        <span className="ml-auto pl-1 text-muted-foreground text-xs">▾</span>
      </button>

      {aberto && (
        <div
          className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-white/15
            bg-[#1a1430] shadow-xl py-1"
        >
          {paises.map((p) => {
            const ativo = p.id === timeId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selecionar(p.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-left transition-colors cursor-pointer
                  ${ativo ? "bg-purple-600/30 text-foreground" : "text-foreground/90 hover:bg-white/10"}`}
              >
                {p.bandeira_url && (
                  <FlagImage src={p.bandeira_url} alt="" size={22} />
                )}
                <span className="truncate">{p.nome}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ResultadoForm({ partida }: ResultadoFormProps) {
  const [golsA, setGolsA] = useState(partida.gols_a ?? "");
  const [golsB, setGolsB] = useState(partida.gols_b ?? "");
  const atualizarResultado = useAtualizarResultado();

  const isMataMata = partida.rodada >= 4;
  const { data: paises } = useAdminPaises();

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

      <div className="flex flex-wrap items-center gap-3">
        {isMataMata ? (
          <TimeSelect
            partida={partida}
            lado="a"
            paises={paises ?? []}
            align="right"
          />
        ) : (
          <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
            {partida.time_a?.bandeira_url && (
              <FlagImage
                src={partida.time_a.bandeira_url}
                alt={nomeA}
                size={28}
              />
            )}
            <span className="text-sm font-medium truncate">{nomeA}</span>
          </div>
        )}

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

        {isMataMata ? (
          <TimeSelect
            partida={partida}
            lado="b"
            paises={paises ?? []}
            align="left"
          />
        ) : (
          <div className="flex flex-1 items-center gap-2 min-w-0">
            {partida.time_b?.bandeira_url && (
              <FlagImage
                src={partida.time_b.bandeira_url}
                alt={nomeB}
                size={28}
              />
            )}
            <span className="text-sm font-medium truncate">{nomeB}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={
            atualizarResultado.isPending || atualizarResultado.isSuccess
          }
          className="w-full sm:w-auto sm:flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#004b87] text-white text-xs font-semibold cursor-pointer
            hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {atualizarResultado.isPending ? "..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
