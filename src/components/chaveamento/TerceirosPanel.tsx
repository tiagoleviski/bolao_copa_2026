"use client";

import { toast } from "sonner";
import { useSalvarGrupo } from "@/hooks/useChaveamento";
import { FlagImage } from "@/components/shared/FlagImage";
import type { Pais, PrevisaoGrupo } from "@/lib/types";

interface TerceirosPanelProps {
  paises: Pais[];
  previsoes: PrevisaoGrupo[];
  prazoEncerrado: boolean;
  onAlterado: () => void;
}

const LIMITE_TERCEIROS = 8;

export function TerceirosPanel({
  paises,
  previsoes,
  prazoEncerrado,
  onAlterado,
}: TerceirosPanelProps) {
  const salvar = useSalvarGrupo();

  // Apenas os times marcados como 3° em seus grupos
  const terceiros = previsoes
    .filter((p) => p.posicao === 3)
    .sort((a, b) => {
      const pa = paises.find((p) => p.id === a.pais_id);
      const pb = paises.find((p) => p.id === b.pais_id);
      return (pa?.grupo ?? "").localeCompare(pb?.grupo ?? "");
    });

  const avancando = terceiros.filter((p) => p.terceiro_avanca);

  function toggle(prev: PrevisaoGrupo) {
    if (prazoEncerrado) return;

    const novoAvanca = !prev.terceiro_avanca;

    if (novoAvanca && avancando.length >= LIMITE_TERCEIROS) {
      toast.error(`Máximo de ${LIMITE_TERCEIROS} terceiros podem avançar.`);
      return;
    }

    salvar.mutate(
      { paisId: prev.pais_id, posicao: 3, terceiroAvanca: novoAvanca },
      {
        onSuccess: onAlterado,
        onError: (err) => toast.error(err.message),
      },
    );
  }

  if (terceiros.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Marque times como 3° nos grupos para selecionar os que avançam.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selecione os 8 melhores terceiros que avançam
        </p>
        <span
          className={`text-sm font-bold ${
            avancando.length === LIMITE_TERCEIROS
              ? "text-green-400"
              : "text-muted-foreground"
          }`}
        >
          {avancando.length}/{LIMITE_TERCEIROS}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {terceiros.map((prev) => {
          const pais = paises.find((p) => p.id === prev.pais_id);
          if (!pais) return null;
          const ativo = prev.terceiro_avanca;
          return (
            <button
              key={prev.pais_id}
              onClick={() => toggle(prev)}
              disabled={prazoEncerrado || salvar.isPending}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition-all cursor-pointer
                ${
                  ativo
                    ? "bg-green-600/20 border-green-500 text-foreground"
                    : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
                }
                ${prazoEncerrado ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {pais.bandeira_url && (
                <FlagImage src={pais.bandeira_url} alt={pais.nome} size={20} />
              )}
              <span className="truncate">{pais.nome}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {pais.grupo}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
