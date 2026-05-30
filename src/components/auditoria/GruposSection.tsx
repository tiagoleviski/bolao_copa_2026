"use client";

import { FlagImage } from "@/components/shared/FlagImage";
import { GRUPOS } from "@/lib/constants";
import type { Pais, Perfil } from "@/lib/types";

interface PrevisaoGrupoComPais {
  user_id: string;
  pais_id: number;
  posicao: 1 | 2 | 3 | 4;
  terceiro_avanca: boolean;
  pais: Pais & { grupo: string };
}

interface GruposSectionProps {
  grupos: PrevisaoGrupoComPais[];
  perfis: Perfil[];
}

export function GruposSection({ grupos, perfis }: GruposSectionProps) {
  const perfisMap = new Map(perfis.map((p) => [p.id, p.nome_completo]));

  if (grupos.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">GRUPOS</h2>
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum participante fez previsão de grupos.
          </p>
        </div>
      </div>
    );
  }

  const porGrupo = new Map<string, PrevisaoGrupoComPais[]>();
  for (const g of grupos) {
    const grupo = g.pais.grupo;
    if (!porGrupo.has(grupo)) porGrupo.set(grupo, []);
    porGrupo.get(grupo)!.push(g);
  }

  const gruposComDados = GRUPOS.filter((g) => porGrupo.has(g));

  return (
    <div className="space-y-2">
      <h2 className="font-display text-2xl text-white">GRUPOS</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {gruposComDados.map((grupo) => (
          <GrupoCard
            key={grupo}
            grupo={grupo}
            previsoes={porGrupo.get(grupo)!}
            perfisMap={perfisMap}
          />
        ))}
      </div>
    </div>
  );
}

function GrupoCard({
  grupo,
  previsoes,
  perfisMap,
}: {
  grupo: string;
  previsoes: PrevisaoGrupoComPais[];
  perfisMap: Map<string, string>;
}) {
  const porUsuario = new Map<string, PrevisaoGrupoComPais[]>();
  for (const p of previsoes) {
    if (!porUsuario.has(p.user_id)) porUsuario.set(p.user_id, []);
    porUsuario.get(p.user_id)!.push(p);
  }

  const usuarios = [...porUsuario.entries()].sort((a, b) => {
    const nA = perfisMap.get(a[0]) ?? "";
    const nB = perfisMap.get(b[0]) ?? "";
    return nA.localeCompare(nB);
  });

  return (
    <div className="glass rounded-xl p-3">
      <h3 className="font-display text-lg text-foreground/70 mb-2">
        Grupo {grupo}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs border-b border-white/5">
              <th className="text-left py-1 pr-2 font-normal">Participante</th>
              <th className="text-center py-1 px-1 font-normal">1º</th>
              <th className="text-center py-1 px-1 font-normal">2º</th>
              <th className="text-center py-1 px-1 font-normal">3º</th>
              <th className="text-center py-1 px-1 font-normal">4º</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(([userId, prev]) => {
              const sorted = [...prev].sort((a, b) => a.posicao - b.posicao);
              const byPos = new Map(sorted.map((p) => [p.posicao, p]));
              return (
                <tr
                  key={userId}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="py-1.5 pr-2 truncate max-w-[100px]">
                    <span className="text-muted-foreground">
                      {perfisMap.get(userId) ?? "?"}
                    </span>
                  </td>
                  {[1, 2, 3, 4].map((pos) => {
                    const p = byPos.get(pos as 1 | 2 | 3 | 4);
                    return (
                      <td key={pos} className="text-center py-1.5 px-1">
                        {p ? (
                          <div className="flex items-center justify-center gap-1">
                            <FlagImage
                              src={p.pais.bandeira_url}
                              alt={p.pais.nome}
                              size={16}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
