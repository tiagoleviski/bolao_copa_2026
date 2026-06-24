"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  useAdminPaises,
  usePosicoesOficiaisGrupo,
  useSalvarPosicoesOficiaisGrupo,
} from "@/hooks/useAdmin";
import { GruposPanelOficial } from "@/components/admin/GruposPanelOficial";
import type { PosicaoOficialLocal } from "@/components/admin/GrupoCardOficial";
import { FlagImage } from "@/components/shared/FlagImage";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { GRUPOS } from "@/lib/constants";

export default function PosicoesGrupoPage() {
  const { data: paises, isPending: loadingPaises } = useAdminPaises();
  const { data: oficiais, isPending: loadingOficiais } =
    usePosicoesOficiaisGrupo();
  const salvar = useSalvarPosicoesOficiaisGrupo();

  const [posicoes, setPosicoes] = useState<PosicaoOficialLocal[]>([]);
  const [salvando, setSalvando] = useState<Set<number>>(new Set());
  const [inicializado, setInicializado] = useState(false);

  useEffect(() => {
    if (oficiais && !inicializado) {
      setPosicoes(
        oficiais
          .filter((o) => o.posicao >= 1 && o.posicao <= 3)
          .map((o) => ({
            pais_id: o.pais_id,
            posicao: o.posicao as 1 | 2 | 3,
            terceiro_avancou: o.terceiro_avancou,
          })),
      );
      setInicializado(true);
    }
  }, [oficiais, inicializado]);

  // ─── Salva uma única posição imediatamente ────────────────────────────────
  // useCallback deve ficar antes de qualquer return condicional

  const salvarPosicao = useCallback(
    (item: {
      pais_id: number;
      posicao: 1 | 2 | 3 | 4;
      terceiro_avancou: boolean;
    }) => {
      setSalvando((prev) => new Set(prev).add(item.pais_id));
      salvar.mutate([item], {
        onSuccess: () => {
          setSalvando((prev) => {
            const next = new Set(prev);
            next.delete(item.pais_id);
            return next;
          });
        },
        onError: (err) => {
          setSalvando((prev) => {
            const next = new Set(prev);
            next.delete(item.pais_id);
            return next;
          });
          toast.error(err.message);
        },
      });
    },
    [salvar],
  );

  if (loadingPaises || loadingOficiais || !paises)
    return <PageSkeleton blocks={3} blockHeight="h-48" />;

  const terceirosAvancando = posicoes.filter(
    (p) => p.posicao === 3 && p.terceiro_avancou,
  ).length;

  // ─── Toggle de posição ────────────────────────────────────────────────────

  function handleToggle(paisId: number, posicao: 1 | 2 | 3) {
    const atual = posicoes.find((p) => p.pais_id === paisId);

    if (atual?.posicao === posicao) {
      // Deselecionar: remove do estado (não apaga do banco — apenas atualiza quando necessário)
      setPosicoes((prev) => prev.filter((p) => p.pais_id !== paisId));
      return;
    }

    const novaEntrada: PosicaoOficialLocal = {
      pais_id: paisId,
      posicao,
      terceiro_avancou: posicao === 3,
    };

    setPosicoes((prev) => {
      const semAtual = prev.filter((p) => p.pais_id !== paisId);
      const nova = [...semAtual, novaEntrada];

      // Se o grupo agora tem 1°, 2° e 3°, também salva o 4° automaticamente
      const pais = paises?.find((p) => p.id === paisId);
      if (pais) {
        const paisesDoGrupo = (paises ?? []).filter(
          (p) => p.grupo === pais.grupo,
        );
        const comPosicao = new Set(nova.map((p) => p.pais_id));
        const semPosicao = paisesDoGrupo.filter((p) => !comPosicao.has(p.id));
        if (semPosicao.length === 1) {
          const quarto = semPosicao[0];
          salvarPosicao({
            pais_id: quarto.id,
            posicao: 4,
            terceiro_avancou: false,
          });
        }
      }

      return nova;
    });

    salvarPosicao(novaEntrada);
  }

  // ─── Toggle de terceiro que avança ────────────────────────────────────────

  function handleToggleTerceiro(paisId: number) {
    const atual = posicoes.find((p) => p.pais_id === paisId);
    if (!atual) return;

    const atualizado = { ...atual, terceiro_avancou: !atual.terceiro_avancou };
    setPosicoes((prev) =>
      prev.map((p) => (p.pais_id === paisId ? atualizado : p)),
    );
    salvarPosicao(atualizado);
  }

  const terceiros = posicoes.filter((p) => p.posicao === 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">POSIÇÕES OFICIAIS</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Clique para definir a posição oficial de cada seleção. Salvo
          automaticamente.
        </p>
      </div>

      <GruposPanelOficial
        paises={paises}
        posicoes={posicoes}
        salvando={salvando}
        terceirosAvancando={terceirosAvancando}
        onToggle={handleToggle}
      />

      {terceiros.length > 0 && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="font-display text-lg text-white">
            TERCEIROS QUE AVANÇAM ({terceirosAvancando}/8)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {terceiros.map((pos) => {
              const pais = paises.find((p) => p.id === pos.pais_id);
              if (!pais) return null;
              const isSalvando = salvando.has(pos.pais_id);
              return (
                <button
                  key={pos.pais_id}
                  onClick={() => {
                    if (!pos.terceiro_avancou && terceirosAvancando >= 8) {
                      toast.error("Máximo de 8 terceiros já selecionados.");
                      return;
                    }
                    handleToggleTerceiro(pos.pais_id);
                  }}
                  disabled={isSalvando}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all cursor-pointer disabled:opacity-50
                    ${
                      pos.terceiro_avancou
                        ? "bg-green-500/20 border-green-400 text-green-300"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                    }`}
                >
                  {pais.bandeira_url && (
                    <FlagImage
                      src={pais.bandeira_url}
                      alt={pais.nome}
                      size={16}
                    />
                  )}
                  <span className="truncate">{pais.nome}</span>
                  {isSalvando && (
                    <span className="ml-auto text-xs opacity-60">…</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
