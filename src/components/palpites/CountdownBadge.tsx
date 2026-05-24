"use client";

import { useCountdown } from "@/hooks/useCountdown";

interface CountdownBadgeProps {
  dataHoraJogo: string;
}

export function CountdownBadge({ dataHoraJogo }: CountdownBadgeProps) {
  const { texto, urgente, encerrado } = useCountdown(dataHoraJogo);

  if (encerrado) {
    return <span className="text-xs text-muted-foreground">Encerrado</span>;
  }

  return (
    <span
      className={`text-xs font-medium ${
        urgente ? "text-red-400" : "text-green-400"
      }`}
    >
      ⏱ {texto}
    </span>
  );
}
