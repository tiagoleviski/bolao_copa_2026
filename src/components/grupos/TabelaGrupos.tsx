"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlagImage } from "@/components/shared/FlagImage";
import type {
  ClassificacaoGrupo,
  ClassificacaoGrupos,
  ClassificacaoEquipe,
} from "@/lib/types";
import { GRUPOS } from "@/lib/constants";

interface Props {
  data: ClassificacaoGrupos;
  terceirosClassificados?: ClassificacaoEquipe[];
}

export function TabelaGrupos({ data, terceirosClassificados }: Props) {
  const grupoMap = new Map(data.map((g) => [g.grupo, g]));
  const todosGruposFinalizados = data.every((g) =>
    g.equipes.every((e) => e.jogos === 3),
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="A">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-white/5 p-1">
          {GRUPOS.map((g) => (
            <TabsTrigger
              key={g}
              value={g}
              className="text-xs px-2.5 py-1 data-[state=active]:bg-[#004b87] data-[state=active]:text-white"
            >
              Grupo {g}
            </TabsTrigger>
          ))}
        </TabsList>

        {GRUPOS.map((g) => {
          const grupo = grupoMap.get(g);
          return (
            <TabsContent key={g} value={g} className="mt-4">
              {grupo ? (
                <TabelaGrupo
                  grupo={grupo}
                  todosFinalizados={todosGruposFinalizados}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Sem dados para o Grupo {g}
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {todosGruposFinalizados &&
        terceirosClassificados &&
        terceirosClassificados.length > 0 && (
          <div className="glass rounded-2xl p-4 space-y-3">
            <h2 className="font-display text-lg text-amber-400">
              MELHORES TERCEIROS COLOCADOS
            </h2>
            <div className="space-y-1">
              {terceirosClassificados.map((equipe, i) => (
                <div
                  key={equipe.pais_id}
                  className="flex items-center gap-3 px-2 py-1.5"
                >
                  <span className="text-xs text-muted-foreground w-4 text-right">
                    {i + 1}
                  </span>
                  <FlagImage
                    src={equipe.bandeira_url}
                    alt={equipe.nome}
                    size={20}
                  />
                  <span className="flex-1 text-sm">{equipe.nome}</span>
                  <span className="text-xs text-muted-foreground">
                    Grupo {equipe.grupo}
                  </span>
                  <span className="text-sm font-bold text-amber-400 w-6 text-right">
                    {equipe.pontos}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

function TabelaGrupo({
  grupo,
  todosFinalizados,
}: {
  grupo: ClassificacaoGrupo;
  todosFinalizados: boolean;
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-xs">
              <th className="text-left px-4 py-2 font-medium w-6">#</th>
              <th className="text-left px-2 py-2 font-medium">Seleção</th>
              <th className="text-center px-2 py-2 font-medium">J</th>
              <th className="text-center px-2 py-2 font-medium">V</th>
              <th className="text-center px-2 py-2 font-medium">E</th>
              <th className="text-center px-2 py-2 font-medium">D</th>
              <th className="text-center px-2 py-2 font-medium">GP</th>
              <th className="text-center px-2 py-2 font-medium">GC</th>
              <th className="text-center px-2 py-2 font-medium">SG</th>
              <th className="text-center px-3 py-2 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {grupo.equipes.map((equipe) => (
              <LinhaEquipe
                key={equipe.pais_id}
                equipe={equipe}
                todosFinalizados={todosFinalizados}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LinhaEquipe({
  equipe,
  todosFinalizados,
}: {
  equipe: ClassificacaoEquipe;
  todosFinalizados: boolean;
}) {
  const classificado = equipe.posicao <= 2;
  const potencialTerceiro = equipe.posicao === 3 && !todosFinalizados;

  return (
    <tr
      className={`border-b border-white/5 last:border-0 transition-colors ${
        classificado
          ? "border-l-2 border-l-green-500"
          : potencialTerceiro
            ? "border-l-2 border-l-amber-500/50"
            : "border-l-2 border-l-transparent"
      }`}
    >
      <td className="px-4 py-2.5 text-xs text-muted-foreground">
        {equipe.posicao}
      </td>
      <td className="px-2 py-2.5">
        <div className="flex items-center gap-2">
          <FlagImage src={equipe.bandeira_url} alt={equipe.nome} size={22} />
          <span className="font-medium text-sm truncate max-w-[120px] sm:max-w-none">
            {equipe.nome}
          </span>
        </div>
      </td>
      <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">
        {equipe.jogos}
      </td>
      <td className="px-2 py-2.5 text-center text-xs">{equipe.vitorias}</td>
      <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">
        {equipe.empates}
      </td>
      <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">
        {equipe.derrotas}
      </td>
      <td className="px-2 py-2.5 text-center text-xs">{equipe.gols_pro}</td>
      <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">
        {equipe.gols_contra}
      </td>
      <td
        className={`px-2 py-2.5 text-center text-xs font-medium ${
          equipe.saldo_gols > 0
            ? "text-green-400"
            : equipe.saldo_gols < 0
              ? "text-red-400"
              : "text-muted-foreground"
        }`}
      >
        {equipe.saldo_gols > 0 ? `+${equipe.saldo_gols}` : equipe.saldo_gols}
      </td>
      <td className="px-3 py-2.5 text-center font-bold text-amber-400">
        {equipe.pontos}
      </td>
    </tr>
  );
}
