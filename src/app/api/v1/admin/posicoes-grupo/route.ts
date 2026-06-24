import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("posicao_oficial_grupo")
      .select("*");
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (e) {
    return handleApiError(e);
  }
}

const putSchema = z.object({
  posicoes: z.array(
    z.object({
      pais_id: z.number().int().positive(),
      posicao: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
      ]),
      terceiro_avancou: z.boolean(),
    }),
  ),
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const parsed = putSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("posicao_oficial_grupo")
      .upsert(parsed.data.posicoes, { onConflict: "pais_id" });

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
