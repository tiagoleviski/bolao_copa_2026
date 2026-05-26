"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BRACKET_PARENTS, BRACKET_SEEDING } from "@/lib/constants";
import { useSalvarChaveamento } from "@/hooks/useChaveamento";
import { FlagImage } from "@/components/shared/FlagImage";
import type {
  FaseChaveamento,
  Pais,
  PrevisaoChaveamento,
  PrevisaoGrupo,
} from "@/lib/types";

type SlotLocal = Pick<PrevisaoChaveamento, "fase" | "slot" | "pais_id">;

// ─── Resoluções de times ──────────────────────────────────────────────────────

function resolveDescriptor(
  desc: string,
  paises: Pais[],
  previsoesGrupo: PrevisaoGrupo[],
): Pais | null {
  if (desc.startsWith("T")) {
    const rank = parseInt(desc.slice(1));
    const terceiros = previsoesGrupo
      .filter((p) => p.posicao === 3 && p.terceiro_avanca)
      .sort((a, b) => {
        const ga = paises.find((p) => p.id === a.pais_id)?.grupo ?? "";
        const gb = paises.find((p) => p.id === b.pais_id)?.grupo ?? "";
        return ga.localeCompare(gb);
      });
    const prev = terceiros[rank - 1];
    return prev ? (paises.find((p) => p.id === prev.pais_id) ?? null) : null;
  }
  const posicao = parseInt(desc[0]);
  const grupo = desc[1];
  const prev = previsoesGrupo.find((p) => {
    const pais = paises.find((pa) => pa.id === p.pais_id);
    return pais?.grupo === grupo && p.posicao === posicao;
  });
  return prev ? (paises.find((p) => p.id === prev.pais_id) ?? null) : null;
}

function getVencedor(
  fase: string,
  slot: number,
  previsoesChaveamento: SlotLocal[],
  paises: Pais[],
): Pais | null {
  const prev = previsoesChaveamento.find(
    (p) => p.fase === fase && p.slot === slot,
  );
  return prev ? (paises.find((p) => p.id === prev.pais_id) ?? null) : null;
}

function getParticipants(
  fase: string,
  slot: number,
  paises: Pais[],
  previsoesGrupo: PrevisaoGrupo[],
  previsoesChaveamento: SlotLocal[],
): [Pais | null, Pais | null] {
  if (fase === "Segunda Fase") {
    const [descA, descB] = BRACKET_SEEDING[slot] ?? ["?", "?"];
    return [
      resolveDescriptor(descA, paises, previsoesGrupo),
      resolveDescriptor(descB, paises, previsoesGrupo),
    ];
  }
  const parents = BRACKET_PARENTS[`${fase}:${slot}`];
  if (!parents) return [null, null];
  return [
    getVencedor(
      parents.faseAnterior,
      parents.slots[0],
      previsoesChaveamento,
      paises,
    ),
    getVencedor(
      parents.faseAnterior,
      parents.slots[1],
      previsoesChaveamento,
      paises,
    ),
  ];
}

// ─── Componente de time ───────────────────────────────────────────────────────

function TeamRow({
  pais,
  selecionado,
  onClick,
  disabled,
}: {
  pais: Pais | null;
  selecionado: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const clicavel = !disabled && !!pais;
  return (
    <button
      onClick={clicavel ? onClick : undefined}
      disabled={!clicavel}
      className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-left transition-colors
        ${selecionado ? "bg-green-600/25 text-white" : pais ? "text-muted-foreground" : "text-white/20"}
        ${clicavel ? "hover:bg-white/10 hover:text-white cursor-pointer" : "cursor-default"}`}
    >
      {pais ? (
        <>
          {pais.bandeira_url && (
            <FlagImage src={pais.bandeira_url} alt={pais.nome} size={14} />
          )}
          <span className="text-[11px] leading-tight truncate max-w-[80px]">
            {pais.nome}
          </span>
          {selecionado && (
            <span className="ml-auto text-green-400 text-[10px]">✓</span>
          )}
        </>
      ) : (
        <span className="text-[11px] italic">—</span>
      )}
    </button>
  );
}

// ─── Partida individual do bracket ───────────────────────────────────────────

function MatchCard({
  fase,
  slot,
  paises,
  previsoesGrupo,
  previsoesChaveamento,
  prazoEncerrado,
  onSelect,
}: {
  fase: FaseChaveamento;
  slot: number;
  paises: Pais[];
  previsoesGrupo: PrevisaoGrupo[];
  previsoesChaveamento: SlotLocal[];
  prazoEncerrado: boolean;
  onSelect: (
    fase: FaseChaveamento,
    slot: number,
    paisId: number | null,
  ) => void;
}) {
  const [teamA, teamB] = getParticipants(
    fase,
    slot,
    paises,
    previsoesGrupo,
    previsoesChaveamento,
  );
  const vencedor = getVencedor(fase, slot, previsoesChaveamento, paises);
  const ambosPresentes = !!teamA && !!teamB;

  function handleClick(pais: Pais) {
    if (!ambosPresentes || prazoEncerrado) return;
    const novo = vencedor?.id === pais.id ? null : pais.id;
    onSelect(fase, slot, novo);
  }

  return (
    <div className="w-[130px] rounded border border-white/15 overflow-hidden bg-white/[0.03]">
      <TeamRow
        pais={teamA}
        selecionado={!!vencedor && vencedor.id === teamA?.id}
        onClick={() => teamA && handleClick(teamA)}
        disabled={prazoEncerrado || !ambosPresentes}
      />
      <div className="h-px bg-white/10" />
      <TeamRow
        pais={teamB}
        selecionado={!!vencedor && vencedor.id === teamB?.id}
        onClick={() => teamB && handleClick(teamB)}
        disabled={prazoEncerrado || !ambosPresentes}
      />
    </div>
  );
}

// ─── Coluna de partidas ───────────────────────────────────────────────────────

const BRACKET_HEIGHT = 544; // px — alinha todas as colunas

function BracketColumn({
  fase,
  slots,
  paises,
  previsoesGrupo,
  previsoesChaveamento,
  prazoEncerrado,
  onSelect,
}: {
  fase: FaseChaveamento;
  slots: number[];
  paises: Pais[];
  previsoesGrupo: PrevisaoGrupo[];
  previsoesChaveamento: SlotLocal[];
  prazoEncerrado: boolean;
  onSelect: (
    fase: FaseChaveamento,
    slot: number,
    paisId: number | null,
  ) => void;
}) {
  return (
    <div
      className="flex flex-col justify-around"
      style={{ height: BRACKET_HEIGHT }}
    >
      {slots.map((slot) => (
        <MatchCard
          key={`${fase}-${slot}`}
          fase={fase}
          slot={slot}
          paises={paises}
          previsoesGrupo={previsoesGrupo}
          previsoesChaveamento={previsoesChaveamento}
          prazoEncerrado={prazoEncerrado}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ─── Bracket completo ─────────────────────────────────────────────────────────

interface BracketProps {
  paises: Pais[];
  previsoesGrupo: PrevisaoGrupo[];
  previsoesChaveamento: SlotLocal[];
  prazoEncerrado: boolean;
}

const COLUNAS_ESQUERDA: { fase: FaseChaveamento; slots: number[] }[] = [
  { fase: "Segunda Fase", slots: [1, 2, 3, 4, 5, 6, 7, 8] },
  { fase: "Oitavas de Final", slots: [1, 2, 3, 4] },
  { fase: "Quartas de Final", slots: [1, 2] },
  { fase: "Semifinal", slots: [1] },
];

const COLUNAS_DIREITA: { fase: FaseChaveamento; slots: number[] }[] = [
  { fase: "Semifinal", slots: [2] },
  { fase: "Quartas de Final", slots: [3, 4] },
  { fase: "Oitavas de Final", slots: [5, 6, 7, 8] },
  { fase: "Segunda Fase", slots: [9, 10, 11, 12, 13, 14, 15, 16] },
];

const LABELS_FASE: Record<string, string> = {
  "Segunda Fase": "Rodada de 32",
  "Oitavas de Final": "Oitavas",
  "Quartas de Final": "Quartas",
  Semifinal: "Semi",
};

export function Bracket({
  paises,
  previsoesGrupo,
  previsoesChaveamento,
  prazoEncerrado,
}: BracketProps) {
  const salvar = useSalvarChaveamento();
  const [local, setLocal] = useState<SlotLocal[]>(previsoesChaveamento);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocal(previsoesChaveamento);
    setDirty(false);
  }, [previsoesChaveamento]);

  function handleSelect(
    fase: FaseChaveamento,
    slot: number,
    paisId: number | null,
  ) {
    setLocal((prev) => {
      const sem = prev.filter((p) => !(p.fase === fase && p.slot === slot));
      if (paisId === null) return sem;
      return [...sem, { fase, slot, pais_id: paisId }];
    });
    setDirty(true);
  }

  function handleSalvar() {
    salvar.mutate(local, {
      onSuccess: () => toast.success("Chaveamento salvo!"),
      onError: (err) => toast.error(err.message),
    });
  }

  const campeao = getVencedor("Final", 1, local, paises);
  const [finalistaA, finalistaB] = getParticipants(
    "Final",
    1,
    paises,
    previsoesGrupo,
    local,
  );

  const columnProps = {
    paises,
    previsoesGrupo,
    previsoesChaveamento: local,
    prazoEncerrado,
    onSelect: handleSelect,
  };

  return (
    <div className="space-y-4">
      {!prazoEncerrado && (
        <div className="flex justify-end">
          <button
            onClick={handleSalvar}
            disabled={!dirty || salvar.isPending}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            {salvar.isPending ? "Salvando…" : "Salvar chaveamento"}
          </button>
        </div>
      )}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-max">
          {/* Cabeçalho com labels das fases */}
          <div className="flex items-end mb-2 gap-2">
            {COLUNAS_ESQUERDA.map(({ fase }) => (
              <div
                key={fase}
                className="w-[130px] text-center text-[10px] text-muted-foreground"
              >
                {LABELS_FASE[fase]}
              </div>
            ))}
            <div className="w-[140px] text-center text-xs text-amber-400 font-bold">
              Final
            </div>
            {COLUNAS_DIREITA.map(({ fase }, i) => (
              <div
                key={`${fase}-r${i}`}
                className="w-[130px] text-center text-[10px] text-muted-foreground"
              >
                {LABELS_FASE[fase]}
              </div>
            ))}
          </div>

          {/* Bracket */}
          <div className="flex items-center gap-2">
            {/* Lado esquerdo */}
            {COLUNAS_ESQUERDA.map(({ fase, slots }) => (
              <BracketColumn
                key={`left-${fase}`}
                fase={fase}
                slots={slots}
                {...columnProps}
              />
            ))}

            {/* Final central */}
            <div
              className="flex flex-col items-center justify-center gap-3 w-[140px]"
              style={{ height: BRACKET_HEIGHT }}
            >
              {/* Partida final */}
              <div className="w-full rounded-lg border border-amber-500/40 overflow-hidden bg-amber-900/10">
                <TeamRow
                  pais={finalistaA}
                  selecionado={!!campeao && campeao.id === finalistaA?.id}
                  onClick={() =>
                    finalistaA &&
                    handleSelect(
                      "Final",
                      1,
                      campeao?.id === finalistaA.id ? null : finalistaA.id,
                    )
                  }
                  disabled={prazoEncerrado || !finalistaA || !finalistaB}
                />
                <div className="h-px bg-amber-500/20" />
                <TeamRow
                  pais={finalistaB}
                  selecionado={!!campeao && campeao.id === finalistaB?.id}
                  onClick={() =>
                    finalistaB &&
                    handleSelect(
                      "Final",
                      1,
                      campeao?.id === finalistaB.id ? null : finalistaB.id,
                    )
                  }
                  disabled={prazoEncerrado || !finalistaA || !finalistaB}
                />
              </div>

              {/* Campeão */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🏆</span>
                {campeao ? (
                  <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 rounded-lg px-2 py-1">
                    {campeao.bandeira_url && (
                      <FlagImage
                        src={campeao.bandeira_url}
                        alt={campeao.nome}
                        size={18}
                      />
                    )}
                    <span className="text-xs font-bold text-amber-300">
                      {campeao.nome}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">
                    Campeão
                  </span>
                )}
              </div>
            </div>

            {/* Lado direito */}
            {COLUNAS_DIREITA.map(({ fase, slots }, i) => (
              <BracketColumn
                key={`right-${fase}-${i}`}
                fase={fase}
                slots={slots}
                {...columnProps}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
