"use client";

import { Lock } from "lucide-react";

interface LockedSectionProps {
  titulo: string;
  prazo: string;
}

export function LockedSection({ titulo, prazo }: LockedSectionProps) {
  return (
    <div className="space-y-2">
      <h2 className="font-display text-2xl text-white">{titulo}</h2>
      <div className="glass rounded-xl p-6 flex flex-col items-center gap-3 text-center">
        <Lock className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          As apostas serão visíveis após o encerramento do prazo em{" "}
          <span className="text-foreground font-medium">{prazo}</span>
        </p>
      </div>
    </div>
  );
}
