"use client";

import { useAuditoria } from "@/hooks/useAuditoria";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { PalpitesSection } from "@/components/auditoria/PalpitesSection";
import { PodioSection } from "@/components/auditoria/PodioSection";
import { GruposSection } from "@/components/auditoria/GruposSection";
import { ArtilheiroSection } from "@/components/auditoria/ArtilheiroSection";
import { LockedSection } from "@/components/auditoria/LockedSection";
import { PRAZO_PREVISOES } from "@/lib/constants";

const prazoFormatado = PRAZO_PREVISOES.toLocaleDateString("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AuditoriaPage() {
  const { data, isPending } = useAuditoria();

  if (isPending) return <PageSkeleton blocks={4} blockHeight="h-48" />;

  const {
    perfis,
    palpites,
    podio,
    grupos,
    artilheiro,
    prazoPrevisoesEncerrado,
  } = data!;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-white">AUDITORIA</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Veja os palpites dos outros participantes
        </p>
      </div>

      {prazoPrevisoesEncerrado && podio !== null ? (
        <PodioSection podio={podio} perfis={perfis} />
      ) : (
        <LockedSection titulo="PÓDIO" prazo={prazoFormatado} />
      )}

      {prazoPrevisoesEncerrado && grupos !== null ? (
        <GruposSection grupos={grupos} perfis={perfis} />
      ) : (
        <LockedSection titulo="GRUPOS" prazo={prazoFormatado} />
      )}

      {prazoPrevisoesEncerrado && artilheiro !== null ? (
        <ArtilheiroSection artilheiro={artilheiro} perfis={perfis} />
      ) : (
        <LockedSection titulo="ARTILHEIRO" prazo={prazoFormatado} />
      )}

      <PalpitesSection palpites={palpites} perfis={perfis} />
    </div>
  );
}
