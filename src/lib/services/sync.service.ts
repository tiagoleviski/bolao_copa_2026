import "server-only";

import type { Pais } from "@/lib/types";

export interface ExternalResult {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  date: string;
}

// Mapeamento dos nomes usados pela football-data.org → nomes no banco (português)
export const API_TEAM_NAME_MAP: Record<string, string> = {
  // América do Sul
  Brazil: "Brasil",
  Argentina: "Argentina",
  Uruguay: "Uruguai",
  Colombia: "Colômbia",
  Ecuador: "Equador",
  Paraguay: "Paraguai",

  // América Central / Norte
  "United States": "Estados Unidos",
  Mexico: "México",
  Canada: "Canadá",
  Panama: "Panamá",
  Haiti: "Haiti",
  Curaçao: "Curaçao",

  // Europa
  Germany: "Alemanha",
  France: "França",
  Spain: "Espanha",
  England: "Inglaterra",
  Portugal: "Portugal",
  Netherlands: "Holanda",
  Belgium: "Bélgica",
  Croatia: "Croácia",
  Switzerland: "Suíça",
  Czechia: "República Tcheca",
  Turkey: "Turquia",
  Austria: "Áustria",
  Scotland: "Escócia",
  Sweden: "Suécia",
  Norway: "Noruega",
  "Bosnia-Herzegovina": "Bósnia e Herzegovina",

  // África
  Morocco: "Marrocos",
  Senegal: "Senegal",
  Algeria: "Argélia",
  Tunisia: "Tunísia",
  "Ivory Coast": "Costa do Marfim",
  "South Africa": "África do Sul",
  Egypt: "Egito",
  Ghana: "Gana",
  "Congo DR": "RD Congo",
  "Cape Verde Islands": "Cabo Verde",

  // Ásia / Oceania
  Japan: "Japão",
  "South Korea": "Coreia do Sul",
  "Saudi Arabia": "Arábia Saudita",
  Australia: "Austrália",
  "New Zealand": "Nova Zelândia",
  Iran: "Irã",
  Iraq: "Iraque",
  Qatar: "Catar",
  Jordan: "Jordânia",
  Uzbekistan: "Uzbequistão",
};

export function resolverTimeId(nomeApi: string, paises: Pais[]): number | null {
  const nomePT = API_TEAM_NAME_MAP[nomeApi] ?? nomeApi;
  const normalizar = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  const alvo = normalizar(nomePT);
  return paises.find((p) => normalizar(p.nome) === alvo)?.id ?? null;
}

export async function fetchResultadosDia(
  date: string,
): Promise<ExternalResult[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error("FOOTBALL_DATA_API_KEY não configurada");

  const url = `https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED&dateFrom=${date}&dateTo=${date}`;
  const res = await fetch(url, {
    headers: {
      "X-Auth-Token": apiKey,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`football-data.org erro: ${res.status}`);

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matches: any[] = json.matches ?? [];

  return matches.map((m) => ({
    fixtureId: m.id,
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeGoals: m.score.fullTime.home ?? 0,
    awayGoals: m.score.fullTime.away ?? 0,
    date: m.utcDate,
  }));
}
