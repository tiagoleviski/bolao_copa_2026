import type { RankingEntry } from "@/lib/types";

interface RankingTableProps {
  entries: RankingEntry[];
  userId: string;
}

export function RankingTable({ entries, userId }: RankingTableProps) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16">
        Nenhum participante ainda.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isMe = entry.user_id === userId;
        return (
          <div
            key={entry.user_id}
            className={`glass rounded-xl px-4 py-3 flex items-center gap-4 transition-colors
              ${isMe ? "border border-purple-500/50 bg-purple-600/10" : ""}`}
          >
            {/* Position */}
            <div className="w-8 text-center flex-shrink-0">
              {entry.posicao <= 3 ? (
                <span className="text-lg">
                  {entry.posicao === 1
                    ? "🥇"
                    : entry.posicao === 2
                      ? "🥈"
                      : "🥉"}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground font-mono">
                  {entry.posicao}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#004b87] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {entry.nome_completo
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p
                className={`font-medium truncate ${isMe ? "text-purple-300" : "text-foreground"}`}
              >
                {entry.nome_completo}
                {isMe && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (você)
                  </span>
                )}
              </p>
              <div className="flex gap-3 mt-0.5">
                <PointsBadge label="Palpites" value={entry.pontos_palpites} />
                <PointsBadge label="Grupos" value={entry.pontos_grupo} />
                <PointsBadge
                  label="Artilheiro"
                  value={entry.pontos_artilheiro}
                />
                <PointsBadge label="Pódio" value={entry.pontos_podio} />
              </div>
            </div>

            {/* Total */}
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-bold text-amber-400">
                {entry.pontos_total}
              </p>
              <p className="text-xs text-muted-foreground">pts</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PointsBadge({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <span className="text-xs text-muted-foreground">
      {label}: <span className="text-foreground">{value}</span>
    </span>
  );
}
