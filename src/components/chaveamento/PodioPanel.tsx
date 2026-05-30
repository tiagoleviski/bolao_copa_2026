"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FlagImage } from "@/components/shared/FlagImage";
import { usePodio, useSalvarPodio } from "@/hooks/usePodio";
import type { Pais } from "@/lib/types";

interface PrevisaoPodioLocal {
  posicao: 1 | 2 | 3;
  pais_id: number;
}

const SLOT_CONFIG = [
  {
    posicao: 2 as const,
    label: "2°",
    altura: "h-20",
    cor: "border-slate-400/60",
    corAtivo: "border-slate-300 ring-2 ring-slate-300/40",
    bg: "bg-slate-500/10",
    medalha: "🥈",
  },
  {
    posicao: 1 as const,
    label: "1°",
    altura: "h-28",
    cor: "border-yellow-500/60",
    corAtivo: "border-yellow-400 ring-2 ring-yellow-400/40",
    bg: "bg-yellow-500/10",
    medalha: "🥇",
  },
  {
    posicao: 3 as const,
    label: "3°",
    altura: "h-14",
    cor: "border-orange-500/60",
    corAtivo: "border-orange-400 ring-2 ring-orange-400/40",
    bg: "bg-orange-500/10",
    medalha: "🥉",
  },
];

interface Props {
  prazoEncerrado: boolean;
}

export function PodioPanel({ prazoEncerrado }: Props) {
  const { data, isPending } = usePodio();
  const salvar = useSalvarPodio();

  const [previsoes, setPrevisoes] = useState<PrevisaoPodioLocal[]>([]);
  const [slotAtivo, setSlotAtivo] = useState<1 | 2 | 3 | null>(null);
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    if (data && !inicializado) {
      setPrevisoes(
        data.apostaPodio.map((a) => ({
          posicao: a.posicao,
          pais_id: a.pais_id,
        })),
      );
      setInicializado(true);
    }
  }, [data, inicializado]);

  if (isPending || !data) return null;

  const { paises } = data;

  const paisesUsados = new Set(previsoes.map((p) => p.pais_id));

  function getPaisDoSlot(posicao: 1 | 2 | 3): Pais | undefined {
    const prev = previsoes.find((p) => p.posicao === posicao);
    if (!prev) return undefined;
    return paises.find((p) => p.id === prev.pais_id);
  }

  function handleSlotClick(posicao: 1 | 2 | 3) {
    if (prazoEncerrado) return;
    setSlotAtivo(slotAtivo === posicao ? null : posicao);
  }

  function handleSelecionarPais(pais: Pais) {
    if (!slotAtivo || prazoEncerrado) return;

    setPrevisoes((prev) => {
      const semSlotAtivo = prev.filter((p) => p.posicao !== slotAtivo);
      const semEssePais = semSlotAtivo.filter((p) => p.pais_id !== pais.id);
      return [...semEssePais, { posicao: slotAtivo, pais_id: pais.id }];
    });

    const proximoSlot = ([1, 2, 3] as const).find(
      (s) => s !== slotAtivo && !previsoes.find((p) => p.posicao === s),
    );
    setSlotAtivo(proximoSlot ?? null);
  }

  function handleRemoverSlot(posicao: 1 | 2 | 3) {
    if (prazoEncerrado) return;
    setPrevisoes((prev) => prev.filter((p) => p.posicao !== posicao));
  }

  function handleSalvar() {
    salvar.mutate(previsoes, {
      onSuccess: () => toast.success("Pódio salvo!"),
      onError: (err) => toast.error(err.message),
    });
  }

  const apostaSalva = data.apostaPodio;
  const temAposta = apostaSalva.length > 0;
  const podioCompleto = previsoes.length === 3;

  const paisesOrdenados = [...paises].sort((a, b) =>
    a.nome.localeCompare(b.nome),
  );

  // Prazo encerrado sem aposta — exibição mínima
  if (prazoEncerrado && !temAposta) {
    return (
      <div className="glass rounded-2xl p-5">
        <SectionHeader />
        <p className="text-muted-foreground text-sm mt-3">
          Prazo encerrado — nenhuma aposta de pódio registrada.
        </p>
      </div>
    );
  }

  // Prazo encerrado com aposta — exibição da aposta feita (read-only)
  if (prazoEncerrado && temAposta) {
    return (
      <div className="glass rounded-2xl p-5">
        <SectionHeader />
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Prazo encerrado — aposta registrada
        </p>
        <div className="flex items-end justify-center gap-2">
          {SLOT_CONFIG.map(({ posicao, label, altura, cor, bg, medalha }) => {
            const pais = getPaisDoSlot(posicao);
            return (
              <div key={posicao} className="flex flex-col items-center gap-1">
                <div
                  className={`w-24 ${altura} rounded-t-xl border ${cor} ${bg} flex flex-col items-center justify-center gap-1 px-2`}
                >
                  {pais ? (
                    <>
                      <FlagImage
                        src={pais.bandeira_url}
                        alt={pais.nome}
                        size={36}
                      />
                      <span className="text-[10px] text-white/80 text-center leading-tight">
                        {pais.nome}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
                <span className="text-xs font-bold text-white/70">
                  {medalha} {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Prazo aberto — edição
  return (
    <div className="glass rounded-2xl p-5 space-y-5">
      <div>
        <SectionHeader />
        <p className="text-xs text-muted-foreground mt-1">
          Selecione um bloco do pódio e depois escolha a seleção abaixo.
        </p>
      </div>

      {/* Pódio visual */}
      <div className="flex items-end justify-center gap-2">
        {SLOT_CONFIG.map(
          ({ posicao, label, altura, cor, corAtivo, bg, medalha }) => {
            const pais = getPaisDoSlot(posicao);
            const ativo = slotAtivo === posicao;
            return (
              <div key={posicao} className="flex flex-col items-center gap-1">
                <div
                  onClick={() => handleSlotClick(posicao)}
                  className={`w-24 ${altura} rounded-t-xl border-2 transition-all cursor-pointer
                  ${ativo ? corAtivo : cor} ${bg}
                  flex flex-col items-center justify-center gap-1 px-2 relative group`}
                >
                  {pais ? (
                    <>
                      <FlagImage
                        src={pais.bandeira_url}
                        alt={pais.nome}
                        size={36}
                      />
                      <span className="text-[10px] text-white/80 text-center leading-tight">
                        {pais.nome}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoverSlot(posicao);
                        }}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/10 hover:bg-white/25 text-white/50 hover:text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 opacity-50">
                      <div className="w-9 h-6 rounded border border-dashed border-current" />
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-bold transition-colors ${
                    ativo ? "text-white" : "text-white/60"
                  }`}
                >
                  {medalha} {label}
                </span>
              </div>
            );
          },
        )}
      </div>

      {/* Seletor de países */}
      {slotAtivo !== null && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Selecionando para{" "}
            <span className="text-white font-semibold">
              {SLOT_CONFIG.find((s) => s.posicao === slotAtivo)?.medalha}{" "}
              {SLOT_CONFIG.find((s) => s.posicao === slotAtivo)?.label} lugar
            </span>
          </p>
          <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto pr-1">
            {paisesOrdenados.map((pais) => {
              const usado = paisesUsados.has(pais.id);
              return (
                <button
                  key={pais.id}
                  onClick={() => handleSelecionarPais(pais)}
                  disabled={usado}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left
                    ${
                      usado
                        ? "opacity-30 cursor-not-allowed bg-white/3"
                        : "bg-white/5 hover:bg-white/10 cursor-pointer"
                    }`}
                >
                  <FlagImage
                    src={pais.bandeira_url}
                    alt={pais.nome}
                    size={20}
                  />
                  <span className="truncate text-white/90">{pais.nome}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Botão salvar */}
      <button
        onClick={handleSalvar}
        disabled={!podioCompleto || salvar.isPending}
        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors cursor-pointer"
      >
        {salvar.isPending ? "Salvando…" : "Salvar pódio"}
      </button>
    </div>
  );
}

function SectionHeader() {
  return (
    <h2 className="font-display text-xl text-white tracking-wide">PÓDIO</h2>
  );
}
