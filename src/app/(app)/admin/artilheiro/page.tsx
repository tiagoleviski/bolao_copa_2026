"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useArtilheiroOficial,
  useSalvarArtilheiroOficial,
} from "@/hooks/useAdmin";
import { FlagImage } from "@/components/shared/FlagImage";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import type { Jogador } from "@/lib/types";

export default function ArtilheiroOficialPage() {
  const { data, isPending } = useArtilheiroOficial();
  const salvar = useSalvarArtilheiroOficial();

  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [busca, setBusca] = useState("");
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    if (data && !inicializado) {
      setSelecionados(data.artilheiros.map((a) => a.jogador_id));
      setInicializado(true);
    }
  }, [data, inicializado]);

  if (isPending || !data)
    return <PageSkeleton blocks={2} blockHeight="h-32" />;

  const jogadores: Jogador[] = data.jogadores.map((j) => ({
    id: j.id,
    nome: j.nome,
    pais: Array.isArray(j.pais) ? j.pais[0] : j.pais,
  }));

  const filtrados = jogadores.filter(
    (j) =>
      j.nome.toLowerCase().includes(busca.toLowerCase()) ||
      j.pais?.nome?.toLowerCase().includes(busca.toLowerCase()),
  );

  function handleToggle(jogadorId: number) {
    setSelecionados((prev) =>
      prev.includes(jogadorId)
        ? prev.filter((id) => id !== jogadorId)
        : [...prev, jogadorId],
    );
  }

  function handleSalvar() {
    salvar.mutate(selecionados, {
      onSuccess: () => toast.success("Artilheiro(s) oficial(is) salvo(s)!"),
      onError: (err) => toast.error(err.message),
    });
  }

  const jogadoresSelecionados = jogadores.filter((j) =>
    selecionados.includes(j.id),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">
          ARTILHEIRO OFICIAL
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Defina o(s) artilheiro(s) da Copa. Em caso de empate em gols,
          selecione todos os empatados.
        </p>
      </div>

      {jogadoresSelecionados.length > 0 && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="font-display text-lg text-white">
            SELECIONADOS ({jogadoresSelecionados.length})
          </h2>
          <div className="space-y-2">
            {jogadoresSelecionados.map((j) => (
              <div
                key={j.id}
                className="flex items-center gap-3 bg-purple-600/20 border border-purple-500/30
                  rounded-xl px-4 py-3"
              >
                {j.pais?.bandeira_url && (
                  <FlagImage
                    src={j.pais.bandeira_url}
                    alt={j.pais.nome}
                    size={32}
                  />
                )}
                <div>
                  <p className="font-semibold text-foreground">{j.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {j.pais?.nome}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(j.id)}
                  className="ml-auto text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
                  title="Remover"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-4 space-y-3">
        <h2 className="font-display text-lg text-white">
          ADICIONAR JOGADOR
        </h2>
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
            const ativo = selecionados.includes(jogador.id);
            return (
              <button
                key={jogador.id}
                onClick={() => handleToggle(jogador.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer
                  ${
                    ativo
                      ? "bg-purple-600/30 border border-purple-500 text-foreground"
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
              >
                {jogador.pais?.bandeira_url && (
                  <FlagImage
                    src={jogador.pais.bandeira_url}
                    alt={jogador.pais.nome}
                    size={24}
                  />
                )}
                <span className="font-medium">{jogador.nome}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {jogador.pais?.nome}
                </span>
                {ativo && (
                  <span className="text-purple-400 text-xs">✓</span>
                )}
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

      <button
        onClick={handleSalvar}
        disabled={salvar.isPending}
        className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50
          text-white font-semibold rounded-xl transition-colors cursor-pointer"
      >
        {salvar.isPending ? "Salvando..." : "Salvar Artilheiro(s)"}
      </button>

      {selecionados.length > 0 && (
        <button
          onClick={() => setSelecionados([])}
          className="ml-3 px-4 py-3 text-sm text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
        >
          Limpar tudo
        </button>
      )}
    </div>
  );
}
