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

export interface Jogador {
  id: number;
  nome: string;
  pais: {
    id: number;
    nome: string;
    bandeira_url: string;
  };
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

export interface ApostaPodio {
  id: number;
  user_id: string;
  posicao: 1 | 2 | 3;
  pais_id: number;
}

export interface PodioOficial {
  id: number;
  posicao: 1 | 2 | 3;
  pais_id: number;
}

export interface RankingEntry {
  user_id: string;
  nome_completo: string;
  pontos_total: number;
  pontos_palpites: number;
  pontos_artilheiro: number;
  pontos_podio: number;
  pontos_grupo: number;
  posicao: number;
}

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

export interface PrevisaoGrupo {
  id: number;
  user_id: string;
  pais_id: number;
  posicao: 1 | 2 | 3 | 4;
  terceiro_avanca: boolean;
}

export interface PosicaoOficialGrupo {
  id: number;
  pais_id: number;
  posicao: 1 | 2 | 3 | 4;
  terceiro_avancou: boolean;
}
