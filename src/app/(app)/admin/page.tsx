"use client";

import { toast } from "sonner";
import { useAdminPartidas, useSyncResultados } from "@/hooks/useAdmin";
import { ResultadoForm } from "@/components/admin/ResultadoForm";
import { RODADA_LABELS } from "@/lib/constants";
import type { Partida } from "@/lib/types";

export default function AdminPage() {
  const { data: partidas, isPending } = useAdminPartidas();
  const sync = useSyncResultados();

  async function handleSync() {
    try {
      const res = await sync.mutateAsync();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { synced, errors } = (res as any).data ?? {};
      if (errors?.length > 0) {
        toast.warning(`${synced} sincronizado(s), ${errors.length} erro(s)`);
      } else {
        toast.success(
          synced > 0
            ? `${synced} resultado(s) sincronizado(s)`
            : "Nenhum resultado novo encontrado",
        );
      }
    } catch {
      toast.error("Erro ao sincronizar resultados");
    }
  }

  if (isPending) return null;

  const porRodada = new Map<number, Partida[]>();
  for (const p of partidas ?? []) {
    const rodada = p.rodada ?? 1;
    const lista = porRodada.get(rodada) ?? [];
    lista.push(p);
    porRodada.set(rodada, lista);
  }
  const rodadas = Array.from(porRodada.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white">ADMIN</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Insira os resultados oficiais das partidas
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={sync.isPending}
          className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#004b87] hover:bg-[#003d70] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {sync.isPending ? (
            <>
              <span className="animate-spin">⟳</span>
              Sincronizando…
            </>
          ) : (
            <>⟳ Sincronizar Resultados</>
          )}
        </button>
      </div>

      {rodadas.map((rodada) => (
        <div key={rodada} className="space-y-3">
          <h2 className="font-display text-2xl text-foreground/80">
            {RODADA_LABELS[rodada] ?? `Rodada ${rodada}`}
          </h2>
          <div className="space-y-2">
            {porRodada.get(rodada)!.map((partida) => (
              <ResultadoForm key={partida.id} partida={partida} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
