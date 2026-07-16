"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useAdminPaises,
  usePodioOficial,
  useSalvarPodioOficial,
} from "@/hooks/useAdmin";
import { FlagImage } from "@/components/shared/FlagImage";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import type { Pais } from "@/lib/types";

const POSICOES = [
  { posicao: 1 as const, label: "Campeão", emoji: "🥇" },
  { posicao: 2 as const, label: "Vice-campeão", emoji: "🥈" },
  { posicao: 3 as const, label: "Terceiro lugar", emoji: "🥉" },
];

export default function PodioOficialPage() {
  const { data: paises, isPending: loadingPaises } = useAdminPaises();
  const { data: podioAtual, isPending: loadingPodio } = usePodioOficial();
  const salvar = useSalvarPodioOficial();

  const [selecao, setSelecao] = useState<Record<number, number | null>>({
    1: null,
    2: null,
    3: null,
  });
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    if (podioAtual && !inicializado) {
      const map: Record<number, number | null> = { 1: null, 2: null, 3: null };
      for (const p of podioAtual) {
        map[p.posicao] = p.pais_id;
      }
      setSelecao(map);
      setInicializado(true);
    }
  }, [podioAtual, inicializado]);

  if (loadingPaises || loadingPodio || !paises)
    return <PageSkeleton blocks={3} blockHeight="h-24" />;

  const paisesUsados = new Set(Object.values(selecao).filter(Boolean));

  function handleSelect(posicao: 1 | 2 | 3, paisId: number | null) {
    setSelecao((prev) => ({ ...prev, [posicao]: paisId }));
  }

  function handleSalvar() {
    const podio = POSICOES.map(({ posicao }) => ({
      posicao,
      pais_id: selecao[posicao]!,
    })).filter((p) => p.pais_id != null);

    salvar.mutate(podio, {
      onSuccess: () => toast.success("Pódio oficial salvo!"),
      onError: (err) => toast.error(err.message),
    });
  }

  const algumPreenchido = Object.values(selecao).some(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">PÓDIO OFICIAL</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Defina campeão, vice e terceiro lugar da Copa.
        </p>
      </div>

      <div className="space-y-4">
        {POSICOES.map(({ posicao, label, emoji }) => (
          <PosicaoSelect
            key={posicao}
            posicao={posicao}
            label={label}
            emoji={emoji}
            paises={paises}
            paisesUsados={paisesUsados}
            value={selecao[posicao]}
            onChange={(paisId) => handleSelect(posicao, paisId)}
          />
        ))}
      </div>

      <button
        onClick={handleSalvar}
        disabled={salvar.isPending}
        className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50
          text-white font-semibold rounded-xl transition-colors cursor-pointer"
      >
        {salvar.isPending ? "Salvando..." : "Salvar Pódio"}
      </button>

      {algumPreenchido && (
        <button
          onClick={() => {
            setSelecao({ 1: null, 2: null, 3: null });
          }}
          className="ml-3 px-4 py-3 text-sm text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
        >
          Limpar tudo
        </button>
      )}
    </div>
  );
}

function PosicaoSelect({
  posicao,
  label,
  emoji,
  paises,
  paisesUsados,
  value,
  onChange,
}: {
  posicao: 1 | 2 | 3;
  label: string;
  emoji: string;
  paises: Pais[];
  paisesUsados: Set<number | null>;
  value: number | null;
  onChange: (paisId: number | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const paisSelecionado = paises.find((p) => p.id === value);
  const filtrados = paises.filter(
    (p) =>
      !paisesUsados.has(p.id) &&
      p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="glass rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <h2 className="font-display text-lg text-white">{label}</h2>
      </div>

      {paisSelecionado ? (
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
          <FlagImage
            src={paisSelecionado.bandeira_url}
            alt={paisSelecionado.nome}
            size={32}
          />
          <span className="font-semibold text-foreground">
            {paisSelecionado.nome}
          </span>
          <button
            onClick={() => {
              onChange(null);
              setAberto(false);
              setBusca("");
            }}
            className="ml-auto text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
          >
            Alterar
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {!aberto ? (
            <button
              onClick={() => setAberto(true)}
              className="w-full text-left px-4 py-3 bg-white/5 border border-dashed border-white/20
                rounded-xl text-muted-foreground hover:border-purple-500 hover:text-white transition-colors cursor-pointer"
            >
              Selecionar seleção...
            </button>
          ) : (
            <>
              <input
                type="text"
                placeholder="Buscar seleção..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm
                  text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none"
              />
              <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl">
                {filtrados.map((pais) => (
                  <button
                    key={pais.id}
                    onClick={() => {
                      onChange(pais.id);
                      setAberto(false);
                      setBusca("");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                      hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors text-left cursor-pointer"
                  >
                    <FlagImage
                      src={pais.bandeira_url}
                      alt={pais.nome}
                      size={24}
                    />
                    <span>{pais.nome}</span>
                  </button>
                ))}
                {filtrados.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    Nenhuma seleção disponível
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
