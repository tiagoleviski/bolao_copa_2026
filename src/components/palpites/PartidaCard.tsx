"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSalvarAposta } from "@/hooks/usePalpites";
import { apostaAberta, formatarHora } from "@/lib/time";
import { calcularPontosPartida } from "@/lib/scoring";
import { RODADA_LABELS } from "@/lib/constants";
import { CountdownBadge } from "./CountdownBadge";
import { FlagImage } from "@/components/shared/FlagImage";
import { VenueInfo } from "@/components/shared/VenueInfo";
import type { Aposta, Partida } from "@/lib/types";

interface PartidaCardProps {
  partida: Partida;
  aposta: Aposta | null;
  forceClosed?: boolean;
}

export function PartidaCard({
  partida,
  aposta,
  forceClosed,
}: PartidaCardProps) {
  const salvarAposta = useSalvarAposta();
  const aberta = forceClosed ? false : apostaAberta(partida.data_hora);
  const [golsA, setGolsA] = useState(aposta?.gols_time_a ?? "");
  const [golsB, setGolsB] = useState(aposta?.gols_time_b ?? "");
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
      salvarAposta.mutate(
        {
          partidaId: partida.id,
          golsTimeA: Number(novoA),
          golsTimeB: Number(novoB),
        },
        {
          onError: (err) => toast.error(err.message),
        },
      );
    }, 600);
  }

  const finalizado = partida.status === "finalizado";

  return (
    <div className="glass rounded-xl p-3 sm:p-4">
      {/* Header row 1: round/group badge + countdown */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {partida.grupo && (
            <span className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
              {partida.grupo}
            </span>
          )}
          {partida.rodada && partida.rodada <= 3 && (
            <span className="text-[10px] uppercase tracking-wide opacity-60">
              {RODADA_LABELS[partida.rodada] ?? `Rodada ${partida.rodada}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {finalizado && (
            <span className="text-xs font-medium text-muted-foreground">
              Finalizado
            </span>
          )}
          {!finalizado && <CountdownBadge dataHoraJogo={partida.data_hora} />}
        </div>
      </div>

      {/* Header row 2: time + venue */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <span className="font-medium text-foreground/70">
          {formatarHora(partida.data_hora)}
        </span>
        <VenueInfo sede={partida.sede} estadio={partida.estadio} />
      </div>

      {/* Teams + Score inputs */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Team A */}
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          <span className="text-sm font-medium text-right sm:truncate">
            {nomeA}
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
          <span className="text-sm font-medium sm:truncate">{nomeB}</span>
        </div>
      </div>

      {finalizado && partida.gols_a !== null && partida.gols_b !== null && (
        <ResultadoFooter partida={partida} aposta={aposta} />
      )}
    </div>
  );
}

function ResultadoFooter({
  partida,
  aposta,
}: {
  partida: Partida;
  aposta: Aposta | null;
}) {
  const pontos = aposta ? calcularPontosPartida(aposta, partida) : null;

  return (
    <div className="mt-3 rounded-lg bg-white/5 border border-white/10 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Resultado oficial</span>
        <span className="text-sm font-bold text-foreground">
          {partida.gols_a} × {partida.gols_b}
        </span>
      </div>

      {pontos ? (
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-xs">
            {pontos.pontos_placar > 0
              ? "Placar exato"
              : pontos.pontos_resultado > 0
                ? "Resultado correto"
                : "Errou o resultado"}
          </span>
          <span
            className={`text-sm font-bold ${pontos.pontos_total > 0 ? "text-copa-gold" : "text-muted-foreground"}`}
          >
            +{pontos.pontos_total} pts
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-xs text-muted-foreground">Sem palpite</span>
          <span className="text-sm font-bold text-muted-foreground">0 pts</span>
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
