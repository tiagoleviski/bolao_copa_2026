"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSalvarApostaArtilheiro } from "@/hooks/useArtilheiro";
import { FlagImage } from "@/components/shared/FlagImage";
import type { Jogador } from "@/lib/types";

interface ArtilheiroSelectProps {
  jogadores: Jogador[];
  jogadorAtualId: number | null;
  prazoEncerrado: boolean;
}

export function ArtilheiroSelect({
  jogadores,
  jogadorAtualId,
  prazoEncerrado,
}: ArtilheiroSelectProps) {
  const [selecionado, setSelecionado] = useState<number | null>(jogadorAtualId);
  const [busca, setBusca] = useState("");
  const salvarArtilheiro = useSalvarApostaArtilheiro();

  const filtrados = jogadores.filter(
    (j) =>
      j.nome.toLowerCase().includes(busca.toLowerCase()) ||
      j.pais.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  function handleSelect(jogadorId: number) {
    if (prazoEncerrado) return;
    setSelecionado(jogadorId);
    salvarArtilheiro.mutate(
      { jogadorId },
      {
        onSuccess: () => toast.success("Aposta no artilheiro salva!"),
        onError: (err) => {
          toast.error(err.message);
          setSelecionado(jogadorAtualId);
        },
      },
    );
  }

  const jogadorSelecionado = jogadores.find((j) => j.id === selecionado);

  return (
    <div className="space-y-4">
      {jogadorSelecionado && (
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          {jogadorSelecionado.pais.bandeira_url && (
            <FlagImage
              src={jogadorSelecionado.pais.bandeira_url}
              alt={jogadorSelecionado.pais.nome}
              size={40}
            />
          )}
          <div>
            <p className="font-semibold text-foreground">
              {jogadorSelecionado.nome}
            </p>
            <p className="text-sm text-muted-foreground">
              {jogadorSelecionado.pais.nome}
            </p>
          </div>
          {salvarArtilheiro.isPending && (
            <span className="ml-auto text-xs text-muted-foreground">
              Salvando...
            </span>
          )}
        </div>
      )}

      {!prazoEncerrado && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Buscar jogador ou seleção..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm
              text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none"
          />

          <div className="max-h-72 overflow-y-auto space-y-1 rounded-xl">
            {filtrados.map((jogador) => {
              const ativo = selecionado === jogador.id;
              return (
                <button
                  key={jogador.id}
                  onClick={() => handleSelect(jogador.id)}
                  disabled={salvarArtilheiro.isPending}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer
                    ${
                      ativo
                        ? "bg-purple-600/30 border border-purple-500 text-foreground"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {jogador.pais.bandeira_url && (
                    <FlagImage
                      src={jogador.pais.bandeira_url}
                      alt={jogador.pais.nome}
                      size={24}
                    />
                  )}
                  <span className="font-medium">{jogador.nome}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {jogador.pais.nome}
                  </span>
                </button>
              );
            })}
            {filtrados.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">
                Nenhum jogador encontrado
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
