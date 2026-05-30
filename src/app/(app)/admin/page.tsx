"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAdminPartidas, useSyncResultados } from "@/hooks/useAdmin";
import { ResultadoCard } from "@/components/admin/ResultadoCard";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import type { Partida } from "@/lib/types";

function chaveData(dataHora: string): string {
  return new Date(dataHora).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleSyncResult(res: any) {
  const { synced, errors } = res.data ?? {};
  if (errors?.length > 0) {
    toast.warning(
      `${synced} sincronizado(s), ${errors.length} erro(s): ${errors[0]}`,
    );
  } else if (synced > 0) {
    toast.success(`${synced} resultado(s) sincronizado(s) com sucesso`);
  } else {
    toast.info("Nenhum resultado novo encontrado");
  }
}

export default function AdminPage() {
  const { data: partidas, isPending } = useAdminPartidas();
  const sync = useSyncResultados();

  useEffect(() => {
    sync.mutate(undefined, {
      onSuccess: handleSyncResult,
      onError: () => toast.error("Erro ao sincronizar resultados"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isPending) return <PageSkeleton blocks={4} blockHeight="h-48" />;

  const porDia = new Map<string, Partida[]>();
  const ordemDias: string[] = [];
  for (const p of partidas ?? []) {
    const dia = chaveData(p.data_hora);
    if (!porDia.has(dia)) {
      ordemDias.push(dia);
      porDia.set(dia, []);
    }
    porDia.get(dia)!.push(p);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white">ADMIN</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Resultados sincronizados automaticamente
          </p>
        </div>
        <button
          onClick={() =>
            sync.mutate(undefined, {
              onSuccess: handleSyncResult,
              onError: () => toast.error("Erro ao sincronizar resultados"),
            })
          }
          disabled={sync.isPending}
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#004b87] hover:bg-[#003d70] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className={sync.isPending ? "animate-spin inline-block" : ""}>
            ⟳
          </span>
          {sync.isPending ? "Sincronizando…" : "Sincronizar"}
        </button>
      </div>

      {ordemDias.map((dia) => (
        <div key={dia} className="space-y-2">
          <h2 className="font-display text-xl text-foreground/50 uppercase tracking-wider px-1">
            {dia}
          </h2>
          <div className="space-y-2">
            {porDia.get(dia)!.map((partida) => (
              <ResultadoCard key={partida.id} partida={partida} />
            ))}
          </div>
        </div>
      ))}

      {ordemDias.length === 0 && (
        <p className="text-muted-foreground text-center py-16">
          Nenhuma partida cadastrada.
        </p>
      )}
    </div>
  );
}
