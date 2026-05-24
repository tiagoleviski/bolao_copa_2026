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

export function tempoAteJogo(dataHoraJogo: string): {
  texto: string;
  urgente: boolean;
  encerrado: boolean;
} {
  const agora = new Date();
  const kickoff = new Date(dataHoraJogo);
  const fechamento = new Date(
    kickoff.getTime() - MINUTOS_ANTES_FECHAMENTO * 60 * 1000,
  );
  const diffMs = fechamento.getTime() - agora.getTime();

  if (diffMs <= 0) {
    return { texto: "Encerrado", urgente: false, encerrado: true };
  }

  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffH > 24) {
    const dias = Math.floor(diffH / 24);
    return {
      texto: `${dias}d ${diffH % 24}h`,
      urgente: false,
      encerrado: false,
    };
  }
  if (diffH > 0) {
    return {
      texto: `${diffH}h ${diffM}m`,
      urgente: diffH < 3,
      encerrado: false,
    };
  }
  return { texto: `${diffM}m`, urgente: true, encerrado: false };
}
