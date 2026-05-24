export interface Pais {
  id: number;
  nome: string;
  grupo: string;
  bandeira_url: string;
}

export interface Partida {
  id: number;
  time_a_id: number;
  time_b_id: number;
  data_hora: string;
  fase: string;
  rodada: number;
  grupo: string | null;
  status: "pendente" | "em_andamento" | "finalizado";
  gols_a: number | null;
  gols_b: number | null;
  sede: string | null;
  estadio: string | null;
  placeholder_time_a: string | null;
  placeholder_time_b: string | null;
  time_a: Pais | null;
  time_b: Pais | null;
}

export interface Aposta {
  id: number;
  user_id: string;
  partida_id: number;
  gols_time_a: number;
  gols_time_b: number;
  pontos_placar: number;
  pontos_resultado: number;
  pontos_total: number;
}

export interface PrevisaoClassificacao {
  id: number;
  user_id: string;
  pais_id: number;
  fase: string;
}

export interface Jogador {
  id: number;
  nome: string;
  selecao: string;
}

export interface ApostaArtilheiro {
  id: number;
  user_id: string;
  jogador_id: number;
  jogador?: Jogador;
}

export interface Perfil {
  id: string;
  nome_completo: string;
  email: string;
}

export interface RankingEntry {
  user_id: string;
  nome_completo: string;
  pontos_total: number;
  pontos_palpites: number;
  pontos_previsoes: number;
  pontos_artilheiro: number;
  posicao: number;
}

export type FaseClassificacao =
  | "Segunda Fase"
  | "Oitavas de Final"
  | "Quartas de Final"
  | "Semifinal"
  | "Campeão"
  | "Vice-Campeão"
  | "3º Lugar"
  | "4º Lugar";

export interface ClassificacaoEquipe {
  pais_id: number;
  nome: string;
  bandeira_url: string;
  grupo: string;
  posicao: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo_gols: number;
  pontos: number;
}

export interface ClassificacaoGrupo {
  grupo: string;
  equipes: ClassificacaoEquipe[];
}

export type ClassificacaoGrupos = ClassificacaoGrupo[];
