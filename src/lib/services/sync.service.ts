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

// Mapeamento dos nomes usados pela API-Football → nomes no banco (português)
export const API_TEAM_NAME_MAP: Record<string, string> = {
  // América do Sul
  Brazil: "Brasil",
  Argentina: "Argentina",
  Uruguay: "Uruguai",
  Colombia: "Colômbia",
  Chile: "Chile",
  Ecuador: "Equador",
  Peru: "Peru",

  // América Central / Norte
  "United States": "Estados Unidos",
  USA: "Estados Unidos",
  Mexico: "México",
  Panama: "Panamá",
  Guatemala: "Guatemala",

  // Europa
  Germany: "Alemanha",
  France: "França",
  Spain: "Espanha",
  England: "Inglaterra",
  Italy: "Itália",
  Portugal: "Portugal",
  Netherlands: "Holanda",
  Belgium: "Bélgica",
  Croatia: "Croácia",
  Serbia: "Sérvia",
  Switzerland: "Suíça",
  Denmark: "Dinamarca",
  Ukraine: "Ucrânia",
  "Czech Republic": "República Checa",
  Czechia: "República Checa",
  Turkey: "Turquia",
  Romania: "Romênia",

  // África
  Morocco: "Marrocos",
  Senegal: "Senegal",
  Nigeria: "Nigéria",
  Algeria: "Argélia",
  Tunisia: "Tunísia",
  Angola: "Angola",
  "Ivory Coast": "Costa do Marfim",
  "Cote d'Ivoire": "Costa do Marfim",

  // Ásia / Oceania
  Japan: "Japão",
  "South Korea": "Coreia do Sul",
  "Korea Republic": "Coreia do Sul",
  "North Korea": "Coreia do Norte",
  "Korea DPR": "Coreia do Norte",
  China: "China",
  "Saudi Arabia": "Arábia Saudita",
  Australia: "Austrália",
  "New Zealand": "Nova Zelândia",
  Afghanistan: "Afeganistão",
  Kyrgyzstan: "Quirguistão",
  Tahiti: "Taiti",
  "Faroe Islands": "Ilhas Faroé",
  Zimbabwe: "Zimbábue",
  "Southeast Asia": "Sudeste Asiático",
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
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) throw new Error("FOOTBALL_API_KEY não configurada");

  const url = `https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${date}&status=FT`;
  const res = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`API-Football erro: ${res.status}`);

  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fixtures: any[] = json.response ?? [];

  return fixtures.map((f) => ({
    fixtureId: f.fixture.id,
    homeTeam: f.teams.home.name,
    awayTeam: f.teams.away.name,
    homeGoals: f.goals.home ?? 0,
    awayGoals: f.goals.away ?? 0,
    date: f.fixture.date,
  }));
}
