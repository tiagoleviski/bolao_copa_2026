import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apostaAberta } from "@/lib/time";

describe("apostaAberta", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna true quando faltam horas para o jogo", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(apostaAberta("2026-06-15T16:00:00Z")).toBe(true);
  });

  it("retorna true 1 segundo antes do kickoff (15:59:59 para jogo às 16:00)", () => {
    vi.setSystemTime(new Date("2026-06-15T15:59:59Z"));
    expect(apostaAberta("2026-06-15T16:00:00Z")).toBe(true);
  });

  it("retorna false exatamente no kickoff (16:00:00)", () => {
    vi.setSystemTime(new Date("2026-06-15T16:00:00Z"));
    expect(apostaAberta("2026-06-15T16:00:00Z")).toBe(false);
  });

  it("retorna false 1 segundo depois do kickoff", () => {
    vi.setSystemTime(new Date("2026-06-15T16:00:01Z"));
    expect(apostaAberta("2026-06-15T16:00:00Z")).toBe(false);
  });

  it("retorna false quando o jogo já terminou", () => {
    vi.setSystemTime(new Date("2026-06-15T18:00:00Z"));
    expect(apostaAberta("2026-06-15T16:00:00Z")).toBe(false);
  });
});
