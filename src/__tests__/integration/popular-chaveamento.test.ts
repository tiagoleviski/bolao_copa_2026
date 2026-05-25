import { describe, it, expect, vi, beforeEach } from "vitest";
import { popularChaveamento } from "@/lib/services/partidas.service";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const PAISES_GRUPO_A = [
  { id: 1, nome: "Brasil", grupo: "A", bandeira_url: "" },
  { id: 2, nome: "Argentina", grupo: "A", bandeira_url: "" },
  { id: 3, nome: "Alemanha", grupo: "A", bandeira_url: "" },
  { id: 4, nome: "França", grupo: "A", bandeira_url: "" },
];

// Grupo A completo: Brasil 1º, Argentina 2º, França 3º, Alemanha 4º
const PARTIDAS_GRUPO_A_COMPLETO = [
  {
    id: 1,
    time_a_id: 1,
    time_b_id: 2,
    gols_a: 2,
    gols_b: 0,
    grupo: "A",
    status: "finalizado",
    rodada: 1,
  },
  {
    id: 2,
    time_a_id: 3,
    time_b_id: 4,
    gols_a: 1,
    gols_b: 1,
    grupo: "A",
    status: "finalizado",
    rodada: 1,
  },
  {
    id: 3,
    time_a_id: 1,
    time_b_id: 3,
    gols_a: 3,
    gols_b: 0,
    grupo: "A",
    status: "finalizado",
    rodada: 2,
  },
  {
    id: 4,
    time_a_id: 2,
    time_b_id: 4,
    gols_a: 1,
    gols_b: 0,
    grupo: "A",
    status: "finalizado",
    rodada: 2,
  },
  {
    id: 5,
    time_a_id: 1,
    time_b_id: 4,
    gols_a: 1,
    gols_b: 0,
    grupo: "A",
    status: "finalizado",
    rodada: 3,
  },
  {
    id: 6,
    time_a_id: 2,
    time_b_id: 3,
    gols_a: 2,
    gols_b: 1,
    grupo: "A",
    status: "finalizado",
    rodada: 3,
  },
];

// Grupo A incompleto: apenas 5 de 6 partidas finalizadas
const PARTIDAS_GRUPO_A_INCOMPLETO = [
  ...PARTIDAS_GRUPO_A_COMPLETO.slice(0, 5),
  {
    ...PARTIDAS_GRUPO_A_COMPLETO[5],
    status: "agendado",
    gols_a: null,
    gols_b: null,
  },
];

function buildClient(config: {
  mataMata: object[];
  partidasGrupo: object[];
  paises: object[];
  updateMock?: ReturnType<typeof vi.fn>;
}) {
  const updateMock =
    config.updateMock ??
    vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

  return {
    updateMock,
    client: {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "partidas") {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                or: vi
                  .fn()
                  .mockResolvedValue({ data: config.mataMata, error: null }),
              }),
              lte: vi
                .fn()
                .mockResolvedValue({ data: config.partidasGrupo, error: null }),
            }),
            update: updateMock,
          };
        }
        if (table === "paises") {
          return {
            select: vi
              .fn()
              .mockResolvedValue({ data: config.paises, error: null }),
          };
        }
        return {};
      }),
    },
  };
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("popularChaveamento", () => {
  beforeEach(() => vi.clearAllMocks());

  it("não atualiza nada quando não há partidas mata-mata com times pendentes", async () => {
    const { client, updateMock } = buildClient({
      mataMata: [],
      partidasGrupo: [],
      paises: [],
    });
    vi.mocked(createClient).mockResolvedValue(client as any);

    await popularChaveamento();

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("não resolve placeholder quando o grupo ainda não terminou (< 6 partidas)", async () => {
    const mataMata = [
      {
        id: 100,
        time_a_id: null,
        time_b_id: null,
        placeholder_time_a: "1º Lugar Grupo A",
        placeholder_time_b: "2º Lugar Grupo A",
      },
    ];
    const { client, updateMock } = buildClient({
      mataMata,
      partidasGrupo: PARTIDAS_GRUPO_A_INCOMPLETO,
      paises: PAISES_GRUPO_A,
    });
    vi.mocked(createClient).mockResolvedValue(client as any);

    await popularChaveamento();

    // Grupo incompleto → nenhum placeholder deve ser resolvido
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("resolve '1º Lugar Grupo A' para o id do 1º colocado quando grupo está completo", async () => {
    const mataMata = [
      {
        id: 100,
        time_a_id: null,
        time_b_id: null,
        placeholder_time_a: "1º Lugar Grupo A",
        placeholder_time_b: "2º Lugar Grupo A",
      },
    ];
    const { client, updateMock } = buildClient({
      mataMata,
      partidasGrupo: PARTIDAS_GRUPO_A_COMPLETO,
      paises: PAISES_GRUPO_A,
    });
    vi.mocked(createClient).mockResolvedValue(client as any);

    await popularChaveamento();

    // Brasil (id=1) é 1º, Argentina (id=2) é 2º no grupo A
    expect(updateMock).toHaveBeenCalledWith({ time_a_id: 1, time_b_id: 2 });
  });

  it("resolve apenas o slot ainda nulo quando um dos times já está preenchido", async () => {
    const mataMata = [
      // time_a_id já preenchido — só time_b deve ser resolvido
      {
        id: 101,
        time_a_id: 99,
        time_b_id: null,
        placeholder_time_a: "1º Lugar Grupo A",
        placeholder_time_b: "2º Lugar Grupo A",
      },
    ];
    const { client, updateMock } = buildClient({
      mataMata,
      partidasGrupo: PARTIDAS_GRUPO_A_COMPLETO,
      paises: PAISES_GRUPO_A,
    });
    vi.mocked(createClient).mockResolvedValue(client as any);

    await popularChaveamento();

    // Só time_b_id deve aparecer no patch
    expect(updateMock).toHaveBeenCalledWith({ time_b_id: 2 });
    expect(updateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ time_a_id: expect.anything() }),
    );
  });

  it("resolve 'Melhor 3º Lugar' somente quando todos os 12 grupos terminaram", async () => {
    const mataMata = [
      {
        id: 200,
        time_a_id: null,
        time_b_id: null,
        placeholder_time_a: "1º Lugar Grupo A",
        placeholder_time_b: "Melhor 3º Lugar (Grupos A/B/C/D/F)",
      },
    ];

    // Apenas grupo A completo → todosGruposFinalizados = false
    const { client, updateMock } = buildClient({
      mataMata,
      partidasGrupo: PARTIDAS_GRUPO_A_COMPLETO,
      paises: PAISES_GRUPO_A,
    });
    vi.mocked(createClient).mockResolvedValue(client as any);

    await popularChaveamento();

    // time_a_id deve ser resolvido (grupo A completo), time_b_id NÃO (faltam outros grupos)
    expect(updateMock).toHaveBeenCalledWith({ time_a_id: 1 });
    expect(updateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ time_b_id: expect.anything() }),
    );
  });

  it("não chama update quando nenhum placeholder pode ser resolvido", async () => {
    const mataMata = [
      {
        id: 300,
        time_a_id: null,
        time_b_id: null,
        placeholder_time_a: "1º Lugar Grupo B",
        placeholder_time_b: "2º Lugar Grupo B",
      },
    ];
    // Apenas grupo A tem dados → grupo B não finalizado
    const { client, updateMock } = buildClient({
      mataMata,
      partidasGrupo: PARTIDAS_GRUPO_A_COMPLETO,
      paises: PAISES_GRUPO_A,
    });
    vi.mocked(createClient).mockResolvedValue(client as any);

    await popularChaveamento();

    expect(updateMock).not.toHaveBeenCalled();
  });
});
