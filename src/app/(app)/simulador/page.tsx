"use client";

import { useMemo, useState } from "react";
import { useSimulador } from "@/hooks/useSimulador";
import { useCurrentUser } from "@/hooks/useAuth";
import { PageSkeleton } from "@/components/shared/PageSkeleton";
import { FlagImage } from "@/components/shared/FlagImage";
import { GRUPOS } from "@/lib/constants";
import {
  CENARIO_VAZIO,
  contarTerceirosSim,
  linhasGruposSim,
  linhasPodioSim,
  simularRanking,
  type Cenario,
  type GrupoSim,
  type SimuladorData,
} from "@/lib/simulacao";

const selectClass =
  "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm " +
  "text-foreground focus:border-purple-500 focus:outline-none cursor-pointer " +
  "[&>option]:text-black";

function novoGruposVazio(): Record<string, GrupoSim> {
  const g: Record<string, GrupoSim> = {};
  for (const letra of GRUPOS) {
    g[letra] = { primeiro: null, segundo: null, terceiro: null };
  }
  return g;
}

export default function SimuladorPage() {
  const { data, isPending } = useSimulador();
  const { data: currentUser } = useCurrentUser();
  const [cenario, setCenario] = useState<Cenario>(CENARIO_VAZIO);

  const resultado = useMemo(
    () => (data ? simularRanking(data, cenario) : null),
    [data, cenario],
  );

  if (isPending || !data || !resultado) {
    return <PageSkeleton blocks={3} blockHeight="h-48" maxWidth="max-w-2xl" />;
  }

  const meuId = currentUser?.id ?? null;
  const selecoesGrupos = linhasGruposSim(cenario.grupos).length;
  const selecoesPodio = linhasPodioSim(cenario.podio).length;
  const partidaSel = cenario.partida
    ? (data.partidasSimulaveis.find((p) => p.id === cenario.partida!.partidaId) ??
      null)
    : null;

  const baselinePts = new Map(
    resultado.baseline.map((e) => [e.user_id, e.pontos_total]),
  );

  const algumaSimulacao =
    cenario.partida !== null ||
    selecoesPodio > 0 ||
    cenario.artilheiroJogadorId !== null ||
    selecoesGrupos > 0;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-4xl text-white">SIMULADOR</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monte um cenário hipotético e veja o impacto no ranking. Nada aqui é
          salvo — é só simulação.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-6">
          <PartidaSection data={data} cenario={cenario} setCenario={setCenario} />

          {data.prazoPrevisoesEncerrado ? (
            <>
              <PodioSection data={data} cenario={cenario} setCenario={setCenario} />
              <ArtilheiroSection
                data={data}
                cenario={cenario}
                setCenario={setCenario}
              />
              <GruposSection
                data={data}
                cenario={cenario}
                setCenario={setCenario}
                meuId={meuId}
              />
            </>
          ) : (
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">
                As simulações de pódio, artilheiro e fase de grupos ficam
                disponíveis após o encerramento do prazo de previsões.
              </p>
            </div>
          )}
        </div>

        {/* ── Ranking simulado ── */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="font-display text-2xl text-foreground/80">
              RANKING SIMULADO
            </h2>
            {algumaSimulacao ? (
              <button
                onClick={() => setCenario(CENARIO_VAZIO)}
                className="text-xs text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
              >
                Limpar cenário
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">
                = ranking atual (nenhuma simulação ativa)
              </span>
            )}
          </div>

          {algumaSimulacao && (
            <div className="flex flex-wrap gap-2 text-xs">
              {cenario.partida && partidaSel && (
                <Chip>
                  {partidaSel.time_a.nome} {cenario.partida.golsA} x{" "}
                  {cenario.partida.golsB} {partidaSel.time_b.nome}
                </Chip>
              )}
              {selecoesPodio > 0 && (
                <Chip>
                  Pódio: {selecoesPodio}{" "}
                  {selecoesPodio === 1 ? "posição" : "posições"}
                </Chip>
              )}
              {cenario.artilheiroJogadorId !== null && (
                <Chip>
                  Artilheiro:{" "}
                  {data.jogadores.find(
                    (j) => j.id === cenario.artilheiroJogadorId,
                  )?.nome ?? "?"}
                </Chip>
              )}
              {selecoesGrupos > 0 && (
                <Chip>
                  Grupos: {selecoesGrupos}{" "}
                  {selecoesGrupos === 1 ? "seleção" : "seleções"}
                </Chip>
              )}
            </div>
          )}

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {resultado.simulado.map((e) => {
              const posBase = resultado.posicaoBase.get(e.user_id) ?? e.posicao;
              const delta = posBase - e.posicao;
              const dPts = e.pontos_total - (baselinePts.get(e.user_id) ?? 0);
              const isMe = e.user_id === meuId;
              return (
                <div
                  key={e.user_id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                    isMe
                      ? "border border-purple-500/50 bg-purple-600/10"
                      : "bg-white/5"
                  }`}
                >
                  <span className="w-7 text-center text-muted-foreground font-mono flex-shrink-0">
                    {e.posicao <= 3
                      ? ["🥇", "🥈", "🥉"][e.posicao - 1]
                      : e.posicao}
                  </span>
                  <span className="w-10 text-xs flex-shrink-0 font-semibold tabular-nums text-center">
                    {delta > 0 && (
                      <span className="text-green-400">▲{delta}</span>
                    )}
                    {delta < 0 && (
                      <span className="text-red-400">▼{-delta}</span>
                    )}
                    {delta === 0 && (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </span>
                  <span
                    className={`flex-1 truncate ${isMe ? "text-purple-300 font-medium" : "text-foreground"}`}
                  >
                    {e.nome_completo}
                    {isMe && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (você)
                      </span>
                    )}
                  </span>
                  {dPts !== 0 && (
                    <span
                      className={`text-xs flex-shrink-0 tabular-nums ${dPts > 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {dPts > 0 ? `+${dPts}` : dPts}
                    </span>
                  )}
                  <span className="font-bold text-amber-400 tabular-nums flex-shrink-0 w-12 text-right">
                    {e.pontos_total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded-full bg-purple-600/25 text-purple-300">
      {children}
    </span>
  );
}

// ─── Seletor de país (mesmo visual do seletor de artilheiro) ─────────────────

function PaisPicker({
  paises,
  value,
  onChange,
  withSearch = false,
  placeholder = "Selecionar...",
  disabled = false,
}: {
  paises: { id: number; nome: string; bandeira_url: string }[];
  value: number | null;
  onChange: (id: number | null) => void;
  withSearch?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const sel = paises.find((p) => p.id === value) ?? null;

  if (sel) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-500/40">
        {sel.bandeira_url && (
          <FlagImage src={sel.bandeira_url} alt={sel.nome} size={24} />
        )}
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {sel.nome}
        </span>
        <button
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
          title="Remover"
        >
          ✕
        </button>
      </div>
    );
  }

  const filtrados = paises.filter(
    (p) => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="space-y-1">
      <button
        onClick={() => {
          if (disabled) return;
          setAberto(!aberto);
          setBusca("");
        }}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm transition-colors ${
          disabled
            ? "opacity-40 cursor-not-allowed text-muted-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-white/15 cursor-pointer"
        }`}
      >
        <span>{placeholder}</span>
        <span className="text-xs">{aberto ? "▴" : "▾"}</span>
      </button>

      {aberto && !disabled && (
        <div className="space-y-1">
          {withSearch && (
            <input
              autoFocus
              type="text"
              placeholder="Buscar seleção..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none"
            />
          )}
          <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl">
            {filtrados.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onChange(p.id);
                  setAberto(false);
                  setBusca("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {p.bandeira_url && (
                  <FlagImage src={p.bandeira_url} alt={p.nome} size={24} />
                )}
                <span className="font-medium">{p.nome}</span>
              </button>
            ))}
            {filtrados.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-3">
                Nenhuma seleção encontrada
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Partida em andamento ────────────────────────────────────────────────────

function PartidaSection({
  data,
  cenario,
  setCenario,
}: {
  data: SimuladorData;
  cenario: Cenario;
  setCenario: React.Dispatch<React.SetStateAction<Cenario>>;
}) {
  const partidas = data.partidasSimulaveis;
  const sel = cenario.partida
    ? (partidas.find((p) => p.id === cenario.partida!.partidaId) ?? null)
    : null;

  function escolher(id: number) {
    const p = partidas.find((x) => x.id === id);
    if (!p) {
      setCenario((c) => ({ ...c, partida: null }));
      return;
    }
    setCenario((c) => ({
      ...c,
      partida: {
        partidaId: p.id,
        golsA: p.gols_a ?? 0,
        golsB: p.gols_b ?? 0,
      },
    }));
  }

  function setGols(lado: "golsA" | "golsB", valor: string) {
    const n = Math.max(0, Math.min(20, Number(valor) || 0));
    setCenario((c) =>
      c.partida ? { ...c, partida: { ...c.partida, [lado]: n } } : c,
    );
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h2 className="font-display text-2xl text-foreground/80">
        PARTIDA EM ANDAMENTO
      </h2>

      {partidas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma partida em andamento agora. O simulador de placar fica
          disponível do início ao fim de cada jogo (quando os palpites já são
          públicos).
        </p>
      ) : (
        <>
          <select
            className={selectClass}
            value={cenario.partida?.partidaId ?? ""}
            onChange={(e) => escolher(Number(e.target.value))}
          >
            <option value="">Escolha a partida...</option>
            {partidas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.time_a.nome} x {p.time_b.nome} ({p.fase})
              </option>
            ))}
          </select>

          {sel && cenario.partida && (
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                <span className="text-sm text-foreground truncate">
                  {sel.time_a.nome}
                </span>
                {sel.time_a.bandeira_url && (
                  <FlagImage
                    src={sel.time_a.bandeira_url}
                    alt={sel.time_a.nome}
                    size={28}
                  />
                )}
              </div>
              <input
                type="number"
                min={0}
                max={20}
                value={cenario.partida.golsA}
                onChange={(e) => setGols("golsA", e.target.value)}
                className="w-14 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
              <span className="text-muted-foreground">x</span>
              <input
                type="number"
                min={0}
                max={20}
                value={cenario.partida.golsB}
                onChange={(e) => setGols("golsB", e.target.value)}
                className="w-14 text-center bg-white/10 border border-white/20 rounded-lg py-2 text-foreground focus:border-purple-500 focus:outline-none"
              />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {sel.time_b.bandeira_url && (
                  <FlagImage
                    src={sel.time_b.bandeira_url}
                    alt={sel.time_b.nome}
                    size={28}
                  />
                )}
                <span className="text-sm text-foreground truncate">
                  {sel.time_b.nome}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Pódio ───────────────────────────────────────────────────────────────────

function PodioSection({
  data,
  cenario,
  setCenario,
}: {
  data: SimuladorData;
  cenario: Cenario;
  setCenario: React.Dispatch<React.SetStateAction<Cenario>>;
}) {
  const disponiveis = data.paises.filter((p) => !p.eliminado);
  const slots = [
    { key: "campeao" as const, label: "🥇 Campeão" },
    { key: "vice" as const, label: "🥈 Vice" },
    { key: "terceiro" as const, label: "🥉 Terceiro" },
  ];
  const escolhidos = cenario.podio;
  const algumPreenchido = linhasPodioSim(escolhidos).length > 0;

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground/80">
          PÓDIO SIMULADO
        </h2>
        {algumPreenchido && (
          <button
            onClick={() =>
              setCenario((c) => ({
                ...c,
                podio: { campeao: null, vice: null, terceiro: null },
              }))
            }
            className="text-xs text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {slots.map((slot) => (
          <div key={slot.key} className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {slot.label}
            </label>
            <PaisPicker
              withSearch
              paises={disponiveis.filter(
                (p) =>
                  p.id === escolhidos[slot.key] ||
                  ![
                    escolhidos.campeao,
                    escolhidos.vice,
                    escolhidos.terceiro,
                  ].includes(p.id),
              )}
              value={escolhidos[slot.key]}
              onChange={(id) =>
                setCenario((c) => ({
                  ...c,
                  podio: { ...c.podio, [slot.key]: id },
                }))
              }
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Seleções já eliminadas não aparecem. A pontuação é aplicada a cada
        posição preenchida — não precisa completar o pódio.
      </p>
    </div>
  );
}

// ─── Artilheiro ──────────────────────────────────────────────────────────────

function ArtilheiroSection({
  data,
  cenario,
  setCenario,
}: {
  data: SimuladorData;
  cenario: Cenario;
  setCenario: React.Dispatch<React.SetStateAction<Cenario>>;
}) {
  const [busca, setBusca] = useState("");
  const selecionado = data.jogadores.find(
    (j) => j.id === cenario.artilheiroJogadorId,
  );
  const filtrados = busca
    ? data.jogadores.filter(
        (j) =>
          j.nome.toLowerCase().includes(busca.toLowerCase()) ||
          j.pais.nome.toLowerCase().includes(busca.toLowerCase()),
      )
    : [];

  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <h2 className="font-display text-2xl text-foreground/80">
        ARTILHEIRO SIMULADO
      </h2>

      {selecionado ? (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-500/40">
          {selecionado.pais.bandeira_url && (
            <FlagImage
              src={selecionado.pais.bandeira_url}
              alt={selecionado.pais.nome}
              size={28}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {selecionado.nome}
            </p>
            <p className="text-xs text-muted-foreground">
              {selecionado.pais.nome}
            </p>
          </div>
          <button
            onClick={() =>
              setCenario((c) => ({ ...c, artilheiroJogadorId: null }))
            }
            className="text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
            title="Remover do cenário"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Buscar jogador ou seleção..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none"
          />
          {busca && (
            <div className="max-h-56 overflow-y-auto space-y-1">
              {filtrados.map((j) => (
                <button
                  key={j.id}
                  onClick={() => {
                    setCenario((c) => ({ ...c, artilheiroJogadorId: j.id }));
                    setBusca("");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {j.pais.bandeira_url && (
                    <FlagImage
                      src={j.pais.bandeira_url}
                      alt={j.pais.nome}
                      size={24}
                    />
                  )}
                  <span className="font-medium">{j.nome}</span>
                  <span className="text-xs ml-auto">{j.pais.nome}</span>
                </button>
              ))}
              {filtrados.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-3">
                  Nenhum jogador encontrado
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Grupos ──────────────────────────────────────────────────────────────────

function GruposSection({
  data,
  cenario,
  setCenario,
  meuId,
}: {
  data: SimuladorData;
  cenario: Cenario;
  setCenario: React.Dispatch<React.SetStateAction<Cenario>>;
  meuId: string | null;
}) {
  const [aberto, setAberto] = useState(false);

  if (data.gruposEncerrados) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-2xl text-foreground/80 mb-2">
          QUEM AVANÇA
        </h2>
        <p className="text-sm text-muted-foreground">
          A fase de grupos já encerrou — a classificação real está sendo usada
          no cálculo.
        </p>
      </div>
    );
  }

  const selecoes = linhasGruposSim(cenario.grupos).length;
  const terceiros = contarTerceirosSim(cenario.grupos);
  const paisesPorGrupo = new Map<string, SimuladorData["paises"]>();
  for (const p of data.paises) {
    if (!paisesPorGrupo.has(p.grupo)) paisesPorGrupo.set(p.grupo, []);
    paisesPorGrupo.get(p.grupo)!.push(p);
  }
  const paisGrupo = new Map(data.paises.map((p) => [p.id, p.grupo]));

  function preencherComMeusPalpites() {
    if (!meuId || !data.previsoesGrupo) return;
    const g = novoGruposVazio();
    let countTerceiros = 0;
    for (const prev of data.previsoesGrupo) {
      if (prev.user_id !== meuId) continue;
      const letra = paisGrupo.get(prev.pais_id);
      if (!letra || !g[letra]) continue;
      if (prev.posicao === 1) g[letra].primeiro = prev.pais_id;
      if (prev.posicao === 2) g[letra].segundo = prev.pais_id;
      if (prev.posicao === 3 && countTerceiros < 8) {
        g[letra].terceiro = prev.pais_id;
        countTerceiros++;
      }
    }
    setCenario((c) => ({ ...c, grupos: g }));
    setAberto(true);
  }

  function setSlot(
    letra: string,
    slot: "primeiro" | "segundo" | "terceiro",
    paisId: number | null,
  ) {
    setCenario((c) => {
      const grupos = { ...(c.grupos ?? novoGruposVazio()) };
      // No máximo 8 terceiros avançam
      if (
        slot === "terceiro" &&
        paisId !== null &&
        grupos[letra].terceiro === null &&
        contarTerceirosSim(grupos) >= 8
      ) {
        return c;
      }
      grupos[letra] = { ...grupos[letra], [slot]: paisId };
      return { ...c, grupos };
    });
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-display text-2xl text-foreground/80">
          QUEM AVANÇA (GRUPOS)
        </h2>
        <button
          onClick={() => setAberto(!aberto)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {aberto ? "Recolher ▲" : "Expandir ▼"}
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span
          className={`px-2 py-1 rounded-full ${
            selecoes > 0
              ? "bg-green-600/25 text-green-300"
              : "bg-white/10 text-muted-foreground"
          }`}
        >
          {selecoes > 0
            ? `${selecoes} ${selecoes === 1 ? "seleção aplicada" : "seleções aplicadas"} · ${terceiros}/8 terceiros`
            : "Cada seleção escolhida já pontua — o 3º escolhido é um dos 8 que avançam"}
        </span>
        <button
          onClick={preencherComMeusPalpites}
          className="px-2 py-1 rounded-full bg-purple-600/25 text-purple-300 hover:bg-purple-600/40 transition-colors cursor-pointer"
        >
          Preencher com meus palpites
        </button>
        {cenario.grupos && (
          <button
            onClick={() => setCenario((c) => ({ ...c, grupos: null }))}
            className="px-2 py-1 rounded-full bg-white/10 text-muted-foreground hover:text-red-400 transition-colors cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      {aberto && (
        <div className="grid sm:grid-cols-2 gap-4">
          {GRUPOS.map((letra) => {
            const g = cenario.grupos?.[letra] ?? {
              primeiro: null,
              segundo: null,
              terceiro: null,
            };
            const paises = paisesPorGrupo.get(letra) ?? [];
            const usados = [g.primeiro, g.segundo, g.terceiro];
            const terceiroBloqueado = g.terceiro === null && terceiros >= 8;
            return (
              <div key={letra} className="rounded-xl bg-white/5 p-3 space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Grupo {letra}
                </p>
                {(["primeiro", "segundo", "terceiro"] as const).map(
                  (slot, idx) => (
                    <div key={slot} className="flex items-start gap-2">
                      <span className="w-6 pt-2.5 text-xs text-muted-foreground flex-shrink-0">
                        {idx + 1}º
                      </span>
                      <div className="flex-1 min-w-0">
                        <PaisPicker
                          paises={paises.filter(
                            (p) => p.id === g[slot] || !usados.includes(p.id),
                          )}
                          value={g[slot]}
                          onChange={(id) => setSlot(letra, slot, id)}
                          disabled={slot === "terceiro" && terceiroBloqueado}
                          placeholder={
                            slot === "terceiro"
                              ? terceiroBloqueado
                                ? "8 terceiros já definidos"
                                : "3º que avança..."
                              : "Selecionar..."
                          }
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
