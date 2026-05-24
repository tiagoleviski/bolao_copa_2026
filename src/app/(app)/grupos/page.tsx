"use client";

import { useGrupos } from "@/hooks/useGrupos";
import { TabelaGrupos } from "@/components/grupos/TabelaGrupos";
import { TOTAL_PARTIDAS_GRUPOS } from "@/lib/constants";

export default function GruposPage() {
  const { data, isPending } = useGrupos();

  if (isPending) return null;

  const classificacao = data?.classificacao ?? [];
  const terceiros = data?.terceiros ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">GRUPOS</h1>
      </div>

      {classificacao.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center space-y-2">
          <p className="text-4xl">⏳</p>
          <p className="font-display text-2xl text-muted-foreground">
            EM BREVE
          </p>
          <p className="text-sm text-muted-foreground">
            A classificação aparece assim que as primeiras partidas forem
            finalizadas
          </p>
        </div>
      ) : (
        <TabelaGrupos data={classificacao} terceirosClassificados={terceiros} />
      )}
    </div>
  );
}
