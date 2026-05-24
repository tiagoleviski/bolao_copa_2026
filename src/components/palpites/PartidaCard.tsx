"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { salvarAposta } from "@/actions/apostas";
import { apostaAberta, formatarData, formatarHora } from "@/lib/time";
import { CountdownBadge } from "./CountdownBadge";
import { FlagImage } from "@/components/shared/FlagImage";
import { VenueInfo } from "@/components/shared/VenueInfo";
import type { Aposta, Partida } from "@/lib/types";

interface PartidaCardProps {
  partida: Partida;
  aposta: Aposta | null;
}

export function PartidaCard({ partida, aposta }: PartidaCardProps) {
  const aberta = apostaAberta(partida.data_hora);
  const [golsA, setGolsA] = useState(aposta?.gols_time_a ?? "");
  const [golsB, setGolsB] = useState(aposta?.gols_time_b ?? "");
  const [salvo, setSalvo] = useState(aposta !== null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nomeA = partida.time_a?.nome ?? partida.placeholder_time_a ?? "?";
  const nomeB = partida.time_b?.nome ?? partida.placeholder_time_b ?? "?";
  const bandA = partida.time_a?.bandeira_url;
  const bandB = partida.time_b?.bandeira_url;

  function handleChange(lado: "a" | "b", valor: string) {
    const num =
      valor === "" ? "" : Math.max(0, Math.min(99, parseInt(valor) || 0));
    if (lado === "a") setGolsA(num);
    else setGolsB(num);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    const novoA = lado === "a" ? num : golsA;
    const novoB = lado === "b" ? num : golsB;

    if (novoA === "" || novoB === "") return;

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const result = await salvarAposta(
          partida.id,
          Number(novoA),
          Number(novoB),
        );
        if (result.error) {
          toast.error(result.error);
        } else {
          setSalvo(true);
        }
      });
    }, 600);
  }

  const finalizado = partida.status === "finalizado";

  return (
    <div className="glass rounded-xl p-3 sm:p-4">
      {/* Header: date, time, venue, deadline */}
      <div className="flex flex-wrap items-center justify-between gap-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {formatarData(partida.data_hora)} ·{" "}
            {formatarHora(partida.data_hora)}
          </span>
          <VenueInfo sede={partida.sede} estadio={null} />
        </div>
        <div className="flex items-center gap-2">
          {finalizado && partida.gols_a !== null && (
            <span className="text-xs text-muted-foreground">
              Resultado: {partida.gols_a}–{partida.gols_b}
            </span>
          )}
          {!finalizado && aberta && (
            <CountdownBadge dataHoraJogo={partida.data_hora} />
          )}
          {salvo && !isPending && (
            <span className="text-xs text-green-400">✓ Salvo</span>
          )}
          {isPending && (
            <span className="text-xs text-muted-foreground">Salvando...</span>
          )}
        </div>
      </div>

      {/* Teams + Score inputs */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Team A */}
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          <span className="text-sm font-medium text-right truncate hidden sm:block">
            {nomeA}
          </span>
          <span className="text-sm font-medium text-right truncate sm:hidden max-w-[72px]">
            {nomeA.split(" ")[0]}
          </span>
          {bandA && <FlagImage src={bandA} alt={nomeA} size={36} />}
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <ScoreInput
            value={golsA}
            onChange={(v) => handleChange("a", v)}
            disabled={!aberta || finalizado}
          />
          <span className="text-muted-foreground text-sm font-bold">×</span>
          <ScoreInput
            value={golsB}
            onChange={(v) => handleChange("b", v)}
            disabled={!aberta || finalizado}
          />
        </div>

        {/* Team B */}
        <div className="flex flex-1 items-center justify-start gap-2 min-w-0">
          {bandB && <FlagImage src={bandB} alt={nomeB} size={36} />}
          <span className="text-sm font-medium truncate hidden sm:block">
            {nomeB}
          </span>
          <span className="text-sm font-medium truncate sm:hidden max-w-[72px]">
            {nomeB.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Points if match is done */}
      {finalizado && aposta && (
        <div className="mt-2 text-center">
          <span className="text-xs font-semibold text-copa-gold">
            +{aposta.pontos_total} pts
          </span>
        </div>
      )}
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  disabled,
}: {
  value: string | number;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="—"
      className={`w-10 h-10 text-center text-lg font-bold rounded-lg border transition-colors
        ${
          disabled
            ? "bg-white/5 border-white/5 text-muted-foreground cursor-not-allowed"
            : "bg-white/10 border-white/20 text-foreground hover:border-purple-500 focus:border-purple-500 focus:outline-none"
        }
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
    />
  );
}
