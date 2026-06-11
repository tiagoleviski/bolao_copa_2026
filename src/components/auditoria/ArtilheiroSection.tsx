"use client";

import { FlagImage } from "@/components/shared/FlagImage";
import type { Jogador, Perfil } from "@/lib/types";

interface ApostaArtilheiroComJogador {
  user_id: string;
  jogador_id: number;
  jogador: Jogador;
}

interface ArtilheiroSectionProps {
  artilheiro: ApostaArtilheiroComJogador[];
  perfis: Perfil[];
}

export function ArtilheiroSection({
  artilheiro,
  perfis,
}: ArtilheiroSectionProps) {
  const perfisMap = new Map(perfis.map((p) => [p.id, p.nome_completo]));

  if (artilheiro.length === 0) {
    return (
      <div className="space-y-2">
        <h2 className="font-display text-2xl text-white">ARTILHEIRO</h2>
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum participante fez aposta de artilheiro.
          </p>
        </div>
      </div>
    );
  }

  const contagemPorJogador = new Map<number, number>();
  for (const a of artilheiro) {
    contagemPorJogador.set(
      a.jogador_id,
      (contagemPorJogador.get(a.jogador_id) ?? 0) + 1,
    );
  }

  const apostasOrdenadas = [...artilheiro].sort((a, b) => {
    const nA = perfisMap.get(a.user_id) ?? "";
    const nB = perfisMap.get(b.user_id) ?? "";
    return nA.localeCompare(nB);
  });

  return (
    <div className="space-y-2">
      <h2 className="font-display text-2xl text-white">ARTILHEIRO</h2>
      <div className="glass rounded-xl p-3 sm:p-4 max-h-[600px] overflow-y-auto">
        <div className="space-y-1.5">
          {apostasOrdenadas.map((a) => (
            <div
              key={a.user_id}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-sm text-muted-foreground truncate">
                {perfisMap.get(a.user_id) ?? "Desconhecido"}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <FlagImage
                  src={a.jogador.pais.bandeira_url}
                  alt={a.jogador.pais.nome}
                  size={18}
                />
                <span className="text-sm font-medium">{a.jogador.nome}</span>
                {(contagemPorJogador.get(a.jogador_id) ?? 0) > 1 && (
                  <span className="text-[10px] text-muted-foreground bg-white/5 rounded px-1.5 py-0.5">
                    {contagemPorJogador.get(a.jogador_id)}×
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
