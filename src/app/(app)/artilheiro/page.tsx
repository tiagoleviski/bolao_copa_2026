"use client";

import { useArtilheiro } from "@/hooks/useArtilheiro";
import { ArtilheiroSelect } from "@/components/artilheiro/ArtilheiroSelect";
import { PRAZO_PREVISOES } from "@/lib/constants";
import type { Pais } from "@/lib/types";

export default function ArtilheiroPage() {
  const { data, isPending } = useArtilheiro();

  if (isPending) return null;

  const { jogadores, paises, apostaAtual } = data!;
  const paisesMap = new Map<string, Pais>(paises.map((p) => [p.nome, p]));
  const prazoEncerrado = new Date() > PRAZO_PREVISOES;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-4xl gradient-copa-text">ARTILHEIRO</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Quem você acha que vai ser o artilheiro da Copa 2026?
        </p>
        {prazoEncerrado && (
          <p className="text-red-400 text-sm mt-2">
            ⏱ Prazo encerrado — apostas bloqueadas
          </p>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">👟</span>
          <h2 className="font-display text-2xl text-amber-400">
            APOSTE NO ARTILHEIRO
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">
            +15 pts se acertar
          </span>
        </div>

        <ArtilheiroSelect
          jogadores={jogadores}
          paisesMap={paisesMap}
          jogadorAtualId={apostaAtual?.jogador_id ?? null}
          prazoEncerrado={prazoEncerrado}
        />
      </div>
    </div>
  );
}
