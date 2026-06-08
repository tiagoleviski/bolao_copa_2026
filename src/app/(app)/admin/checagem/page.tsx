"use client";

import { useChecagem } from "@/hooks/useChecagem";
import { PageSkeleton } from "@/components/shared/PageSkeleton";

function corStatus(feito: number, total: number) {
  if (total > 0 && feito >= total) return "text-green-400";
  if (feito > 0) return "text-yellow-400";
  return "text-red-400/70";
}

function Cell({ feito, total }: { feito: number; total: number }) {
  return (
    <span className={`font-semibold tabular-nums ${corStatus(feito, total)}`}>
      {feito}/{total}
    </span>
  );
}

export default function ChecagemPage() {
  const { data, isPending } = useChecagem();

  if (isPending || !data) return <PageSkeleton blocks={1} blockHeight="h-96" />;

  const { usuarios, fases, totalGrupos, totalTerceiros } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">CHECAGEM</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Status de preenchimento de cada participante (sem revelar os palpites)
        </p>
      </div>

      <div className="glass rounded-2xl p-2 sm:p-4 overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-muted-foreground border-b border-white/10">
              <th rowSpan={2} className="px-3 py-2 font-medium text-left align-bottom">
                Participante
              </th>
              <th
                colSpan={fases.length}
                className="px-3 py-1 font-medium text-center border-b border-white/10"
              >
                Palpites dos jogos
              </th>
              <th rowSpan={2} className="px-3 py-2 font-medium text-center align-bottom">
                Pódio
              </th>
              <th rowSpan={2} className="px-3 py-2 font-medium text-center align-bottom">
                Grupos
              </th>
              <th rowSpan={2} className="px-3 py-2 font-medium text-center align-bottom">
                3ºs
              </th>
              <th rowSpan={2} className="px-3 py-2 font-medium text-center align-bottom">
                Artilheiro
              </th>
            </tr>
            <tr className="text-muted-foreground border-b border-white/10">
              {fases.map((f) => (
                <th key={f.key} className="px-2 py-1 font-medium text-center text-xs">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.user_id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-3 py-2">
                  <p className="text-foreground font-medium truncate max-w-48">
                    {u.nome_completo}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-48">
                    {u.email}
                  </p>
                </td>
                {fases.map((f) => (
                  <td key={f.key} className="px-2 py-2 text-center">
                    <Cell feito={u.palpitesPorFase[f.key] ?? 0} total={f.total} />
                  </td>
                ))}
                <td className="px-3 py-2 text-center">
                  <Cell feito={u.podio} total={3} />
                </td>
                <td className="px-3 py-2 text-center">
                  <Cell feito={u.gruposCompletos} total={totalGrupos} />
                </td>
                <td className="px-3 py-2 text-center">
                  <Cell feito={u.terceiros} total={totalTerceiros} />
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={u.artilheiro ? "text-green-400" : "text-red-400/70"}>
                    {u.artilheiro ? "✓" : "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Nenhum participante cadastrado ainda.
          </p>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <span className="text-green-400">Verde</span> = completo ·{" "}
          <span className="text-yellow-400">amarelo</span> = parcial ·{" "}
          <span className="text-red-400/70">vermelho</span> = não preenchido.
        </p>
        <p>
          Palpites estão divididos por fase (até onde cada um preencheu). Grupos =
          grupos com 1º e 2º definidos; 3ºs = seleções marcadas para avançar.
        </p>
      </div>
    </div>
  );
}
