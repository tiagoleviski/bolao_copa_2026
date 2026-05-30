"use client";

import { useEffect, useState } from "react";
import { tempoAteJogo } from "@/lib/time";

export function useCountdown(dataHoraJogo: string) {
  const [estado, setEstado] = useState(() => tempoAteJogo(dataHoraJogo));

  useEffect(() => {
    const interval = setInterval(() => {
      setEstado(tempoAteJogo(dataHoraJogo));
    }, 1_000);
    return () => clearInterval(interval);
  }, [dataHoraJogo]);

  return estado;
}
