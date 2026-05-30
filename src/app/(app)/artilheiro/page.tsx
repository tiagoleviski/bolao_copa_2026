"use client";

import { useArtilheiro } from "@/hooks/useArtilheiro";
import { ArtilheiroSelect } from "@/components/artilheiro/ArtilheiroSelect";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { CountdownBadge } from "@/components/palpites/CountdownBadge";
import { PRAZO_ARTILHEIRO } from "@/lib/constants";

export default function ArtilheiroPage() {
  const { data, isPending } = useArtilheiro();

  if (isPending)
    return <PageSkeleton blocks={1} blockHeight="h-40" maxWidth="max-w-2xl" />;

  const { jogadores, apostaAtual } = data!;
  const prazoEncerrado = new Date() > PRAZO_ARTILHEIRO;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-4xl text-white">ARTILHEIRO</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Quem você acha que vai ser o artilheiro da Copa 2026?
        </p>
        {prazoEncerrado ? (
          <p className="text-red-400 text-sm mt-2">
            Prazo encerrado! Apostas bloqueadas
          </p>
        ) : (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-muted-foreground text-sm">
              Aposte até o 1º jogo:
            </span>
            <CountdownBadge dataHoraJogo={PRAZO_ARTILHEIRO.toISOString()} />
          </div>
        )}
      </div>

      {(!prazoEncerrado || apostaAtual) && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👟</span>
            <h2 className="font-display text-2xl text-amber-400">
              {prazoEncerrado ? "MINHA APOSTA" : "APOSTE NO ARTILHEIRO"}
            </h2>
          </div>

          <ArtilheiroSelect
            jogadores={jogadores}
            jogadorAtualId={apostaAtual?.jogador_id ?? null}
            prazoEncerrado={prazoEncerrado}
          />
        </div>
      )}
    </div>
  );
}
