import { MINUTOS_ANTES_FECHAMENTO } from "./constants";

export function toLocaleBRT(dateStr: string): Date {
  return new Date(dateStr);
}

export function formatarDataHora(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarData(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatarHora(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function apostaAberta(dataHoraJogo: string): boolean {
  const agora = new Date();
  const kickoff = new Date(dataHoraJogo);
  const fechamento = new Date(
    kickoff.getTime() - MINUTOS_ANTES_FECHAMENTO * 60 * 1000,
  );
  return agora < fechamento;
}

export interface ContadorDetalhado {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  urgente: boolean;
  encerrado: boolean;
}

export function tempoAteJogo(dataHoraJogo: string): ContadorDetalhado {
  const agora = new Date();
  const kickoff = new Date(dataHoraJogo);
  const fechamento = new Date(
    kickoff.getTime() - MINUTOS_ANTES_FECHAMENTO * 60 * 1000,
  );
  const diffMs = fechamento.getTime() - agora.getTime();

  if (diffMs <= 0) {
    return {
      dias: 0,
      horas: 0,
      minutos: 0,
      segundos: 0,
      urgente: false,
      encerrado: true,
    };
  }

  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diffMs % (1000 * 60)) / 1000);
  const totalHoras = Math.floor(diffMs / (1000 * 60 * 60));

  return {
    dias,
    horas,
    minutos,
    segundos,
    urgente: totalHoras < 3,
    encerrado: false,
  };
}
