import { describe, it, expect, vi, beforeEach } from "vitest";
import { atualizarResultadoPartida } from "@/lib/services/partidas.service";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Builds a mock Supabase client configured for a specific test scenario
function buildMockClient(
  apostasData: { id: number; gols_time_a: number; gols_time_b: number }[],
) {
  const apostasUpdateMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ data: null, error: null }),
  });

  const client = {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "apostas") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: apostasData, error: null }),
          }),
          update: apostasUpdateMock,
        };
      }
      if (table === "partidas") {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
          select: vi.fn().mockReturnValue({
            // popularChaveamento: mataMata query → [] faz early-return
            gte: vi.fn().mockReturnValue({
              or: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
            // popularChaveamento: partidasGrupo query
            lte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      if (table === "paises") {
        return {
          select: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {};
    }),
  };

  return { client, apostasUpdateMock };
}

describe("atualizarResultadoPartida", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("atualiza a partida com gols e status finalizado", async () => {
    const { client } = buildMockClient([]);
    vi.mocked(createClient).mockResolvedValue(client as any);

    await atualizarResultadoPartida(42, 2, 1);

    // Verifica que from("partidas").update() foi chamado com os dados corretos
    const fromCalls = client.from.mock.calls;
    const partidaCall = fromCalls.find(([t]: [string]) => t === "partidas");
    expect(partidaCall).toBeDefined();

    const updateCall = client.from("partidas").update;
    expect(updateCall).toBeDefined();
  });

  it("calcula 2 pts para aposta com placar exato", async () => {
    const apostas = [{ id: 10, gols_time_a: 2, gols_time_b: 1 }];
    const { client, apostasUpdateMock } = buildMockClient(apostas);
    vi.mocked(createClient).mockResolvedValue(client as any);

    await atualizarResultadoPartida(42, 2, 1);

    expect(apostasUpdateMock).toHaveBeenCalledWith({
      pontos_placar: 2,
      pontos_resultado: 0,
      pontos_total: 2,
    });
  });

  it("calcula 1 pt para resultado correto (placar diferente)", async () => {
    const apostas = [{ id: 11, gols_time_a: 3, gols_time_b: 0 }];
    const { client, apostasUpdateMock } = buildMockClient(apostas);
    vi.mocked(createClient).mockResolvedValue(client as any);

    // Real: 1-0, apostou: 3-0 — resultado correto mas placar errado
    await atualizarResultadoPartida(42, 1, 0);

    expect(apostasUpdateMock).toHaveBeenCalledWith({
      pontos_placar: 0,
      pontos_resultado: 1,
      pontos_total: 1,
    });
  });

  it("calcula 0 pts para resultado errado", async () => {
    const apostas = [{ id: 12, gols_time_a: 1, gols_time_b: 0 }];
    const { client, apostasUpdateMock } = buildMockClient(apostas);
    vi.mocked(createClient).mockResolvedValue(client as any);

    // Real: 0-1, apostou: 1-0 — resultado completamente errado
    await atualizarResultadoPartida(42, 0, 1);

    expect(apostasUpdateMock).toHaveBeenCalledWith({
      pontos_placar: 0,
      pontos_resultado: 0,
      pontos_total: 0,
    });
  });

  it("processa múltiplas apostas com pontuações diferentes", async () => {
    const apostas = [
      { id: 10, gols_time_a: 2, gols_time_b: 1 }, // exato → 2pts
      { id: 11, gols_time_a: 3, gols_time_b: 0 }, // resultado correto → 1pt
      { id: 12, gols_time_a: 0, gols_time_b: 1 }, // errado → 0pts
    ];
    const { client, apostasUpdateMock } = buildMockClient(apostas);
    vi.mocked(createClient).mockResolvedValue(client as any);

    await atualizarResultadoPartida(42, 2, 1);

    expect(apostasUpdateMock).toHaveBeenCalledTimes(3);
    expect(apostasUpdateMock).toHaveBeenCalledWith({
      pontos_placar: 2,
      pontos_resultado: 0,
      pontos_total: 2,
    });
    expect(apostasUpdateMock).toHaveBeenCalledWith({
      pontos_placar: 0,
      pontos_resultado: 1,
      pontos_total: 1,
    });
    expect(apostasUpdateMock).toHaveBeenCalledWith({
      pontos_placar: 0,
      pontos_resultado: 0,
      pontos_total: 0,
    });
  });

  it("não chama update de apostas quando não há apostas na partida", async () => {
    const { client, apostasUpdateMock } = buildMockClient([]);
    vi.mocked(createClient).mockResolvedValue(client as any);

    await atualizarResultadoPartida(42, 2, 1);

    expect(apostasUpdateMock).not.toHaveBeenCalled();
  });
});
