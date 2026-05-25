import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apostaAberta } from "@/lib/time";

describe("apostaAberta", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna true quando faltam mais de 60 min para o jogo", () => {
    // Agora = 12:00, jogo = 15:00 → 180 min de antecedência
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(apostaAberta("2026-06-15T15:00:00Z")).toBe(true);
  });

  it("retorna false quando faltam exatamente 60 min (fechamento no limite)", () => {
    vi.setSystemTime(new Date("2026-06-15T14:00:00Z"));
    expect(apostaAberta("2026-06-15T15:00:00Z")).toBe(false);
  });

  it("retorna false quando faltam menos de 60 min", () => {
    vi.setSystemTime(new Date("2026-06-15T14:30:00Z"));
    expect(apostaAberta("2026-06-15T15:00:00Z")).toBe(false);
  });

  it("retorna false quando o jogo já passou", () => {
    vi.setSystemTime(new Date("2026-06-15T17:00:00Z"));
    expect(apostaAberta("2026-06-15T15:00:00Z")).toBe(false);
  });

  it("retorna true quando falta 61 min (ainda aberta)", () => {
    vi.setSystemTime(new Date("2026-06-15T13:59:00Z"));
    expect(apostaAberta("2026-06-15T15:00:00Z")).toBe(true);
  });
});
