"use client";

import { useCountdown } from "@/hooks/useCountdown";

interface CountdownBadgeProps {
  dataHoraJogo: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownBadge({ dataHoraJogo }: CountdownBadgeProps) {
  const { dias, horas, minutos, segundos, urgente, encerrado } =
    useCountdown(dataHoraJogo);

  if (encerrado) {
    return <span className="text-xs text-muted-foreground">Encerrado</span>;
  }

  return (
    <div
      className={`flex items-center gap-0.5 font-mono text-xs font-semibold tabular-nums ${
        urgente ? "text-red-400" : "text-green-400"
      }`}
    >
      <span title="dias">{pad(dias)}</span>
      <span className="opacity-60">d</span>
      <span className="opacity-40 mx-0.5">:</span>
      <span title="horas">{pad(horas)}</span>
      <span className="opacity-60">h</span>
      <span className="opacity-40 mx-0.5">:</span>
      <span title="minutos">{pad(minutos)}</span>
      <span className="opacity-60">m</span>
      <span className="opacity-40 mx-0.5">:</span>
      <span title="segundos">{pad(segundos)}</span>
      <span className="opacity-60">s</span>
    </div>
  );
}
