"use client";

import { FlagImage } from "@/components/shared/FlagImage";
import type { Pais, Perfil } from "@/lib/types";

interface ApostaPodioComPais {
  user_id: string;
  posicao: 1 | 2 | 3;
  pais_id: number;
  pais: Pais;
}

interface PodioSectionProps {
  podio: ApostaPodioComPais[];
  perfis: Perfil[];
}

const POSICAO_LABEL: Record<number, string> = {
  1: "1º",
  2: "2º",
  3: "3º",
};

const POSICAO_COLOR: Record<number, string> = {
  1: "text-amber-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

export function PodioSection({ podio, perfis }: PodioSectionProps) {
  const perfisMap = new Map(perfis.map((p) => [p.id, p.nome_completo]));

  if (podio.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">PÓDIO</h2>
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum participante fez aposta de pódio.
          </p>
        </div>
      </div>
    );
  }

  const porUsuario = new Map<string, ApostaPodioComPais[]>();
  for (const aposta of podio) {
    if (!porUsuario.has(aposta.user_id)) {
      porUsuario.set(aposta.user_id, []);
    }
    porUsuario.get(aposta.user_id)!.push(aposta);
  }

  const usuarios = [...porUsuario.entries()].sort((a, b) => {
    const nA = perfisMap.get(a[0]) ?? "";
    const nB = perfisMap.get(b[0]) ?? "";
    return nA.localeCompare(nB);
  });

  return (
    <div className="space-y-2">
      <h2 className="font-display text-2xl text-white">PÓDIO</h2>
      <div className="max-h-[480px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {usuarios.map(([userId, apostas]) => {
          const sorted = [...apostas].sort((a, b) => a.posicao - b.posicao);
          return (
            <div key={userId} className="glass rounded-xl p-3">
              <p className="text-sm font-medium mb-2 truncate">
                {perfisMap.get(userId) ?? "Desconhecido"}
              </p>
              <div className="space-y-1">
                {sorted.map((a) => (
                  <div key={a.posicao} className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold w-5 ${POSICAO_COLOR[a.posicao]}`}
                    >
                      {POSICAO_LABEL[a.posicao]}
                    </span>
                    <FlagImage
                      src={a.pais.bandeira_url}
                      alt={a.pais.nome}
                      size={20}
                    />
                    <span className="text-sm text-muted-foreground truncate">
                      {a.pais.nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
