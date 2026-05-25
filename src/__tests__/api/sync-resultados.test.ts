import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/admin/sync-resultados/route";
import { createClient } from "@/lib/supabase/server";
import * as syncService from "@/lib/services/sync.service";
import * as partidasService from "@/lib/services/partidas.service";

// Mocks declarados antes de qualquer import que os usa
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/services/partidas.service", () => ({
  atualizarResultadoPartida: vi.fn().mockResolvedValue(undefined),
}));

// fetchResultadosDia é mockado; resolverTimeId permanece REAL (testa o mapeamento)
vi.mock("@/lib/services/sync.service", async (importOriginal) => {
  const original = await importOriginal<typeof syncService>();
  return { ...original, fetchResultadosDia: vi.fn() };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAISES = [
  { id: 1, nome: "Brasil", grupo: "A", bandeira_url: "" },
  { id: 2, nome: "Argentina", grupo: "A", bandeira_url: "" },
  { id: 3, nome: "Alemanha", grupo: "B", bandeira_url: "" },
];

function buildSupabaseMock(
  paises = PAISES,
  partidas = [
    {
      id: 10,
      time_a_id: 1,
      time_b_id: 2,
      status: "agendado",
      gols_a: null,
      gols_b: null,
    },
  ],
) {
  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === "paises") {
        return {
          select: vi.fn().mockResolvedValue({ data: paises, error: null }),
        };
      }
      if (table === "partidas") {
        return {
          select: vi.fn().mockReturnValue({
            neq: vi.fn().mockResolvedValue({ data: partidas, error: null }),
          }),
        };
      }
      return {};
    }),
  };
}

function makeRequest(cronSecret?: string) {
  return new NextRequest("http://localhost/api/v1/admin/sync-resultados", {
    method: "POST",
    headers: cronSecret ? { authorization: `Bearer ${cronSecret}` } : {},
  });
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("POST /api/v1/admin/sync-resultados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
  });

  it("retorna 401 sem autenticação quando não há CRON_SECRET no header", async () => {
    // Sem CRON_SECRET no header → cai no requireAdmin → mockado para lançar AuthError
    const { requireAdmin } = await import("@/lib/auth/guards");
    vi.mocked(requireAdmin).mockRejectedValueOnce(
      Object.assign(new Error("Não autenticado."), { status: 401 }),
    );

    vi.mocked(createClient).mockResolvedValue(buildSupabaseMock() as any);

    const res = await POST(makeRequest());
    expect(res.status).toBe(400); // handleApiError trata Error genérico como 400
  });

  it("aceita requisição com CRON_SECRET válido sem chamar requireAdmin", async () => {
    vi.mocked(syncService.fetchResultadosDia).mockResolvedValue([]);
    vi.mocked(createClient).mockResolvedValue(buildSupabaseMock() as any);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ synced: 0, skipped: 0, errors: [] });
  });

  it("sincroniza uma partida e retorna synced: 1", async () => {
    vi.mocked(syncService.fetchResultadosDia).mockResolvedValue([
      {
        fixtureId: 999,
        homeTeam: "Brazil",
        awayTeam: "Argentina",
        homeGoals: 2,
        awayGoals: 1,
        date: "2026-06-15",
      },
    ]);
    vi.mocked(createClient).mockResolvedValue(buildSupabaseMock() as any);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(body.synced).toBe(1);
    expect(body.skipped).toBe(0);
    expect(body.errors).toHaveLength(0);
    expect(partidasService.atualizarResultadoPartida).toHaveBeenCalledWith(
      10,
      2,
      1,
    );
  });

  it("inverte gols corretamente quando DB tem time_a/time_b na ordem inversa da API", async () => {
    // API retorna "Argentina" como home, mas no DB partida_id=10 tem time_a=Brasil(1), time_b=Argentina(2)
    vi.mocked(syncService.fetchResultadosDia).mockResolvedValue([
      {
        fixtureId: 999,
        homeTeam: "Argentina",
        awayTeam: "Brazil",
        homeGoals: 3,
        awayGoals: 0,
        date: "2026-06-15",
      },
    ]);
    vi.mocked(createClient).mockResolvedValue(buildSupabaseMock() as any);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(body.synced).toBe(1);
    // time_a_id=1 (Brasil) é awayTeam → golsA = awayGoals = 0
    // time_b_id=2 (Argentina) é homeTeam → golsB = homeGoals = 3
    expect(partidasService.atualizarResultadoPartida).toHaveBeenCalledWith(
      10,
      0,
      3,
    );
  });

  it("incrementa skipped quando partida não está no banco", async () => {
    vi.mocked(syncService.fetchResultadosDia).mockResolvedValue([
      {
        fixtureId: 1,
        homeTeam: "Germany",
        awayTeam: "France",
        homeGoals: 1,
        awayGoals: 0,
        date: "2026-06-15",
      },
    ]);
    // Paises inclui Alemanha(3) mas não França; partidas não têm esse confronto
    const paisesComFranca = [
      ...PAISES,
      { id: 4, nome: "França", grupo: "C", bandeira_url: "" },
    ];
    vi.mocked(createClient).mockResolvedValue(
      buildSupabaseMock(paisesComFranca, []) as any,
    );

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(body.skipped).toBe(1);
    expect(body.synced).toBe(0);
  });

  it("acumula erro quando time não é reconhecido pelo resolverTimeId", async () => {
    vi.mocked(syncService.fetchResultadosDia).mockResolvedValue([
      {
        fixtureId: 2,
        homeTeam: "Nárnia",
        awayTeam: "Mordor",
        homeGoals: 1,
        awayGoals: 0,
        date: "2026-06-15",
      },
    ]);
    vi.mocked(createClient).mockResolvedValue(buildSupabaseMock() as any);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(body.errors).toHaveLength(1);
    expect(body.errors[0]).toContain("Nárnia");
    expect(body.synced).toBe(0);
  });

  it("continua sincronizando as demais partidas quando uma falha", async () => {
    vi.mocked(syncService.fetchResultadosDia).mockResolvedValue([
      {
        fixtureId: 1,
        homeTeam: "Brazil",
        awayTeam: "Argentina",
        homeGoals: 1,
        awayGoals: 0,
        date: "2026-06-15",
      },
      {
        fixtureId: 2,
        homeTeam: "Brazil",
        awayTeam: "Argentina",
        homeGoals: 2,
        awayGoals: 0,
        date: "2026-06-15",
      },
    ]);
    const duasPartidas = [
      {
        id: 10,
        time_a_id: 1,
        time_b_id: 2,
        status: "agendado",
        gols_a: null,
        gols_b: null,
      },
      {
        id: 11,
        time_a_id: 1,
        time_b_id: 2,
        status: "agendado",
        gols_a: null,
        gols_b: null,
      },
    ];
    vi.mocked(createClient).mockResolvedValue(
      buildSupabaseMock(PAISES, duasPartidas) as any,
    );

    // Primeira partida falha, segunda deve ser processada
    vi.mocked(partidasService.atualizarResultadoPartida)
      .mockRejectedValueOnce(new Error("DB timeout"))
      .mockResolvedValueOnce(undefined);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(body.synced).toBe(1);
    expect(body.errors).toHaveLength(1);
    expect(body.errors[0]).toContain("DB timeout");
  });

  it("retorna synced: 0 quando não há resultados do dia", async () => {
    vi.mocked(syncService.fetchResultadosDia).mockResolvedValue([]);
    vi.mocked(createClient).mockResolvedValue(buildSupabaseMock() as any);

    const res = await POST(makeRequest("test-secret"));
    const body = await res.json();

    expect(body).toEqual({ synced: 0, skipped: 0, errors: [] });
  });
});
