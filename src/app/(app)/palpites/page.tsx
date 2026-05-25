"use client";

import { usePalpites } from "@/hooks/usePalpites";
import { DiaSection } from "@/components/palpites/DiaSection";
import type { Partida } from "@/lib/types";

function chaveData(dataHora: string): string {
  return new Date(dataHora).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export default function PalpitesPage() {
  const { data, isPending } = usePalpites();

  if (isPending) return null;

  const { partidas, apostasMap } = data!;

  const porDia = new Map<string, Partida[]>();
  const ordemDias: string[] = [];
  for (const p of partidas) {
    const dia = chaveData(p.data_hora);
    if (!porDia.has(dia)) {
      ordemDias.push(dia);
      porDia.set(dia, []);
    }
    porDia.get(dia)!.push(p);
  }

  const hojeChave = chaveData(new Date().toISOString());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-white">MEUS PALPITES</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Insira o placar que você prevê para cada partida
        </p>
      </div>

      {ordemDias.map((dia) => (
        <DiaSection
          key={dia}
          dia={dia}
          isHoje={dia === hojeChave}
          partidas={porDia.get(dia)!}
          apostasMap={apostasMap}
        />
      ))}

      {ordemDias.length === 0 && (
        <p className="text-muted-foreground text-center py-16">
          Nenhuma partida cadastrada.
        </p>
      )}
    </div>
  );
}
