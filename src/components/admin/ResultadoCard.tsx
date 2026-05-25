import { FlagImage } from "@/components/shared/FlagImage";
import { formatarDataHora } from "@/lib/time";
import type { Partida } from "@/lib/types";

interface ResultadoCardProps {
  partida: Partida;
}

export function ResultadoCard({ partida }: ResultadoCardProps) {
  const nomeA = partida.time_a?.nome ?? partida.placeholder_time_a ?? "?";
  const nomeB = partida.time_b?.nome ?? partida.placeholder_time_b ?? "?";
  const finalizado = partida.status === "finalizado";

  const golsA = partida.gols_a ?? null;
  const golsB = partida.gols_b ?? null;

  return (
    <div
      className={`glass rounded-xl p-4 space-y-3 ${finalizado ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatarDataHora(partida.data_hora)}</span>
        {finalizado && (
          <span className="text-green-400 font-medium">✓ Finalizado</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center justify-end gap-2">
          {partida.time_a?.bandeira_url && (
            <FlagImage
              src={partida.time_a.bandeira_url}
              alt={nomeA}
              size={28}
            />
          )}
          <span className="text-sm font-medium truncate">{nomeA}</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="w-10 h-9 flex items-center justify-center font-bold rounded-lg bg-white/10 border border-white/20 text-sm">
            {golsA !== null ? golsA : "–"}
          </div>
          <span className="text-muted-foreground">–</span>
          <div className="w-10 h-9 flex items-center justify-center font-bold rounded-lg bg-white/10 border border-white/20 text-sm">
            {golsB !== null ? golsB : "–"}
          </div>
        </div>

        <div className="flex flex-1 items-center gap-2">
          {partida.time_b?.bandeira_url && (
            <FlagImage
              src={partida.time_b.bandeira_url}
              alt={nomeB}
              size={28}
            />
          )}
          <span className="text-sm font-medium truncate">{nomeB}</span>
        </div>
      </div>
    </div>
  );
}
