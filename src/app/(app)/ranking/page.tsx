"use client";

import { useRanking } from "@/hooks/useRanking";
import { RankingTable } from "@/components/ranking/RankingTable";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RankingPage() {
  const { data, isPending } = useRanking();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setUserId(user?.id ?? null));
  }, []);

  if (isPending || !userId) return null;

  const { ranking, totalPartidasFinalizadas } = data!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl gradient-copa-text">RANKING</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {totalPartidasFinalizadas > 0
            ? `${totalPartidasFinalizadas} partida${totalPartidasFinalizadas !== 1 ? "s" : ""} finalizada${totalPartidasFinalizadas !== 1 ? "s" : ""}`
            : "O torneio ainda não começou"}
        </p>
      </div>

      {totalPartidasFinalizadas === 0 && (
        <div className="glass rounded-2xl p-8 text-center space-y-2">
          <p className="text-4xl">⏳</p>
          <p className="font-display text-2xl text-muted-foreground">
            EM BREVE
          </p>
          <p className="text-sm text-muted-foreground">
            A pontuação começa assim que as primeiras partidas forem finalizadas
          </p>
        </div>
      )}

      <RankingTable entries={ranking} userId={userId} />
    </div>
  );
}
