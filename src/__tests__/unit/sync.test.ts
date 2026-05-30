import { describe, it, expect } from "vitest";
import { resolverTimeId } from "@/lib/services/sync.service";
import type { Pais } from "@/lib/types";

const PAISES: Pais[] = [
  { id: 1, nome: "Brasil", grupo: "A", bandeira_url: "" },
  { id: 2, nome: "Alemanha", grupo: "B", bandeira_url: "" },
  { id: 3, nome: "França", grupo: "C", bandeira_url: "" },
  { id: 4, nome: "Estados Unidos", grupo: "D", bandeira_url: "" },
  { id: 5, nome: "Coreia do Sul", grupo: "E", bandeira_url: "" },
];

describe("resolverTimeId", () => {
  it("resolve nome da API para id correto via mapa", () => {
    expect(resolverTimeId("Brazil", PAISES)).toBe(1);
    expect(resolverTimeId("Germany", PAISES)).toBe(2);
    expect(resolverTimeId("France", PAISES)).toBe(3);
    expect(resolverTimeId("United States", PAISES)).toBe(4);
    expect(resolverTimeId("South Korea", PAISES)).toBe(5);
  });

  it("resolve nome já em português sem passar pelo mapa", () => {
    expect(resolverTimeId("Brasil", PAISES)).toBe(1);
  });

  it("é case-insensitive", () => {
    expect(resolverTimeId("brasil", PAISES)).toBe(1);
    expect(resolverTimeId("BRASIL", PAISES)).toBe(1);
  });

  it("normaliza acentos", () => {
    // "Franca" sem cedilha deve encontrar "França"
    expect(resolverTimeId("Franca", PAISES)).toBe(3);
  });

  it("retorna null para nome desconhecido", () => {
    expect(resolverTimeId("Nárnia", PAISES)).toBeNull();
  });

  it("retorna null para lista de países vazia", () => {
    expect(resolverTimeId("Brazil", [])).toBeNull();
  });
});
