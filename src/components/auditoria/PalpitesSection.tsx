"use client";

import { FlagImage } from "@/components/shared/FlagImage";
import { formatarHora } from "@/lib/time";
import { RODADA_LABELS } from "@/lib/constants";
import type { Partida, Perfil } from "@/lib/types";

interface ApostaPalpite {
  user_id: string;
  gols_time_a: number;
  gols_time_b: number;
}

interface PalpitesSectionProps {
  palpites: { partida: Partida; apostas: ApostaPalpite[] }[];
  perfis: Perfil[];
}

function chaveData(dataHora: string): string {
  return new Date(dataHora).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function PalpitesSection({ palpites, perfis }: PalpitesSectionProps) {
  const perfisMap = new Map(perfis.map((p) => [p.id, p.nome_completo]));

  if (palpites.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">PALPITES</h2>
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum palpite disponível ainda, as apostas ficam visíveis após o
            início de cada partida.
          </p>
        </div>
      </div>
    );
  }

  const porDia = new Map<string, typeof palpites>();
  const ordemDias: string[] = [];
  for (const item of palpites) {
    const dia = chaveData(item.partida.data_hora);
    if (!porDia.has(dia)) {
      ordemDias.push(dia);
      porDia.set(dia, []);
    }
    porDia.get(dia)!.push(item);
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl text-white">PALPITES</h2>

      {ordemDias.map((dia) => (
        <div key={dia} className="space-y-2">
          <h3 className="font-display text-lg text-foreground/50 uppercase tracking-wider px-1">
            {dia}
          </h3>
          {porDia.get(dia)!.map(({ partida, apostas }) => (
            <PartidaAuditoriaCard
              key={partida.id}
              partida={partida}
              apostas={apostas}
              perfisMap={perfisMap}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function PartidaAuditoriaCard({
  partida,
  apostas,
  perfisMap,
}: {
  partida: Partida;
  apostas: ApostaPalpite[];
  perfisMap: Map<string, string>;
}) {
  const nomeA = partida.time_a?.nome ?? partida.placeholder_time_a ?? "?";
  const nomeB = partida.time_b?.nome ?? partida.placeholder_time_b ?? "?";
  const bandA = partida.time_a?.bandeira_url;
  const bandB = partida.time_b?.bandeira_url;
  const finalizado = partida.status === "finalizado";

  const apostasOrdenadas = [...apostas].sort((a, b) => {
    const nA = perfisMap.get(a.user_id) ?? "";
    const nB = perfisMap.get(b.user_id) ?? "";
    return nA.localeCompare(nB);
  });

  return (
    <div className="glass rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {partida.grupo && (
            <span className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
              {partida.grupo}
            </span>
          )}
          {partida.rodada && partida.rodada <= 3 && (
            <span className="text-[10px] uppercase tracking-wide opacity-60">
              {RODADA_LABELS[partida.rodada] ?? `Rodada ${partida.rodada}`}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatarHora(partida.data_hora)}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 mb-3">
        <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
          <span className="text-sm font-medium text-right truncate">
            {nomeA}
          </span>
          {bandA && <FlagImage src={bandA} alt={nomeA} size={28} />}
        </div>

        {finalizado && partida.gols_a !== null ? (
          <span className="text-lg font-bold text-amber-400 flex-shrink-0 min-w-[60px] text-center">
            {partida.gols_a} × {partida.gols_b}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground flex-shrink-0 min-w-[60px] text-center">
            vs
          </span>
        )}

        <div className="flex flex-1 items-center justify-start gap-2 min-w-0">
          {bandB && <FlagImage src={bandB} alt={nomeB} size={28} />}
          <span className="text-sm font-medium truncate">{nomeB}</span>
        </div>
      </div>

      {apostasOrdenadas.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-1">
          Nenhum participante apostou nesta partida
        </p>
      ) : (
        <div className="border-t border-white/5 pt-2 space-y-1">
          {apostasOrdenadas.map((aposta) => (
            <div
              key={aposta.user_id}
              className="flex items-center justify-between text-sm px-1"
            >
              <span className="text-muted-foreground truncate mr-2">
                {perfisMap.get(aposta.user_id) ?? "Desconhecido"}
              </span>
              <span className="font-medium flex-shrink-0">
                {aposta.gols_time_a} × {aposta.gols_time_b}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
