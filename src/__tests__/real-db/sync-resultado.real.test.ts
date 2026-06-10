/**
 * Testes de integração com banco real.
 *
 * Requer em .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   ← chave de serviço, não a anon key
 *
 * Rode com: npm run test:real
 *
 * O que é testado aqui que os testes com mock NÃO garantem:
 *   - O banco realmente recebe status="finalizado" e os gols corretos
 *   - As apostas realmente têm os pontos gravados no banco
 *   - O calcularClassificacaoGrupos aplicado sobre dados reais do banco
 *     reflete México com 3pts e África do Sul com 0pts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { atualizarResultadoPartida } from "@/lib/services/partidas.service";
import { calcularClassificacaoGrupos } from "@/lib/services/classificacao.service";

// ─── Cliente admin (service role — bypassa RLS) ───────────────────────────────
//
// vi.hoisted() é içado junto com vi.mock(), garantindo que adminClient
// existe quando o factory do mock roda.

const adminClient = vi.hoisted(() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "\n\nFaltam variáveis de ambiente para testes reais.\n" +
        "Adicione ao .env.local:\n" +
        "  SUPABASE_SERVICE_ROLE_KEY=<sua service role key>\n" +
        "(Painel Supabase → Project Settings → API → service_role)\n",
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key);
});

// Substitui o cliente SSR/cookies pelo cliente admin real
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue(adminClient),
}));

// ─── Helpers de seed/cleanup ──────────────────────────────────────────────────

async function seedPartida(timeAId: number, timeBId: number) {
  const { data, error } = await adminClient
    .from("partidas")
    .insert({
      time_a_id: timeAId,
      time_b_id: timeBId,
      data_hora: "2030-06-15T18:00:00Z", // data futura — não interfere com syncs reais
      fase: "Grupos",
      rodada: 1,
      grupo: "A",
      status: "agendado",
    })
    .select("id")
    .single();
  if (error) throw new Error(`seed partida: ${error.message}`);
  return data.id as number;
}

async function seedPaises() {
  const { data, error } = await adminClient
    .from("paises")
    .insert([
      { nome: "__test_mexico__", grupo: "A", bandeira_url: "" },
      { nome: "__test_africa_do_sul__", grupo: "A", bandeira_url: "" },
    ])
    .select("id, nome");
  if (error) throw new Error(`seed paises: ${error.message}`);
  return { mexicoId: data[0].id as number, africaId: data[1].id as number };
}

async function seedAposta(
  userId: string,
  partidaId: number,
  golsA: number,
  golsB: number,
) {
  const { data, error } = await adminClient
    .from("apostas")
    .insert({
      user_id: userId,
      partida_id: partidaId,
      gols_time_a: golsA,
      gols_time_b: golsB,
    })
    .select("id")
    .single();
  if (error) throw new Error(`seed aposta: ${error.message}`);
  return data.id as number;
}

async function criarUsuarioTeste(suffix: number): Promise<string> {
  // Timestamp garante email único mesmo se a suite anterior não limpou
  const email = `__test_bolao_${suffix}_${Date.now()}__@test.internal`;
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: "test_bolao_123456",
    email_confirm: true,
    user_metadata: { nome_completo: `__test_user_${suffix}__` },
  });
  if (error) throw new Error(`criar usuário de teste: ${error.message}`);
  return data.user!.id;
}

// ─── Suite ───────────────────────────────────────────────────────────────────���

describe("[REAL DB] sincronizar resultado de uma partida", () => {
  let mexicoId: number;
  let africaId: number;
  let partidaId: number;
  let testUserIds: string[] = [];

  beforeAll(async () => {
    // Cria 3 usuários reais em auth.users — necessário pela FK de apostas.user_id
    testUserIds = await Promise.all([1, 2, 3].map(criarUsuarioTeste));
  });

  afterAll(async () => {
    for (const uid of testUserIds) {
      await adminClient.auth.admin.deleteUser(uid);
    }
  });

  beforeEach(async () => {
    const paises = await seedPaises();
    mexicoId = paises.mexicoId;
    africaId = paises.africaId;
    partidaId = await seedPartida(mexicoId, africaId);
  });

  afterEach(async () => {
    // Limpa em ordem inversa às FK constraints
    await adminClient.from("apostas").delete().eq("partida_id", partidaId);
    await adminClient.from("partidas").delete().eq("id", partidaId);
    await adminClient.from("paises").delete().in("id", [mexicoId, africaId]);
  });

  it("grava status=finalizado e gols no banco após sync 1-0 México", async () => {
    await atualizarResultadoPartida(partidaId, 1, 0);

    const { data } = await adminClient
      .from("partidas")
      .select("status, gols_a, gols_b")
      .eq("id", partidaId)
      .single();

    expect(data!.status).toBe("finalizado");
    expect(data!.gols_a).toBe(1);
    expect(data!.gols_b).toBe(0);
  });

  it("México tem 3pts e África do Sul 0pts no calcularClassificacaoGrupos com dados reais", async () => {
    await atualizarResultadoPartida(partidaId, 1, 0);

    // Busca a partida do banco (estado real após o update)
    const { data: partidas } = await adminClient
      .from("partidas")
      .select("id, time_a_id, time_b_id, gols_a, gols_b, grupo, status, rodada")
      .eq("id", partidaId);

    // Paises de teste — grupo "A" para o calcularClassificacaoGrupos processar
    const paisesTest = [
      { id: mexicoId, nome: "__test_mexico__", grupo: "A", bandeira_url: "" },
      {
        id: africaId,
        nome: "__test_africa_do_sul__",
        grupo: "A",
        bandeira_url: "",
      },
    ];

    const standings = calcularClassificacaoGrupos(partidas!, paisesTest);
    const grupoA = standings.find((g) => g.grupo === "A")!;

    const mexico = grupoA.equipes.find((e) => e.pais_id === mexicoId)!;
    const africa = grupoA.equipes.find((e) => e.pais_id === africaId)!;

    expect(mexico.pontos).toBe(3);
    expect(mexico.vitorias).toBe(1);
    expect(mexico.posicao).toBe(1);

    expect(africa.pontos).toBe(0);
    expect(africa.derrotas).toBe(1);
    expect(africa.posicao).toBe(2);
  });

  it("grava 3pts na aposta de quem acertou o placar exato (1-0)", async () => {
    const apostaId = await seedAposta(testUserIds[0], partidaId, 1, 0); // apostou 1-0 → exato

    await atualizarResultadoPartida(partidaId, 1, 0);

    const { data } = await adminClient
      .from("apostas")
      .select("pontos_placar, pontos_resultado, pontos_total")
      .eq("id", apostaId)
      .single();

    expect(data!.pontos_placar).toBe(3);
    expect(data!.pontos_resultado).toBe(0);
    expect(data!.pontos_total).toBe(3);
  });

  it("grava 5pts na aposta de quem acertou só o resultado (2-0 apostado, 1-0 real)", async () => {
    const apostaId = await seedAposta(testUserIds[1], partidaId, 2, 0); // apostou 2-0

    await atualizarResultadoPartida(partidaId, 1, 0); // real: 1-0

    const { data } = await adminClient
      .from("apostas")
      .select("pontos_placar, pontos_resultado, pontos_total")
      .eq("id", apostaId)
      .single();

    expect(data!.pontos_placar).toBe(0);
    expect(data!.pontos_resultado).toBe(5);
    expect(data!.pontos_total).toBe(5);
  });

  it("grava 0pts na aposta de quem errou o resultado (apostou empate)", async () => {
    const apostaId = await seedAposta(testUserIds[2], partidaId, 0, 0); // apostou 0-0

    await atualizarResultadoPartida(partidaId, 1, 0); // real: 1-0

    const { data } = await adminClient
      .from("apostas")
      .select("pontos_total")
      .eq("id", apostaId)
      .single();

    expect(data!.pontos_total).toBe(0);
  });
});
