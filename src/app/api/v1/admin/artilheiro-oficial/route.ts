import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const [artilheiros, jogadores] = await Promise.all([
      supabase
        .from("artilheiro_oficial")
        .select("id, jogador_id")
        .then(({ data, error }) => {
          if (error) throw new Error(error.message);
          return data ?? [];
        }),
      supabase
        .from("jogadores")
        .select("id, nome, pais:paises(id, nome, bandeira_url)")
        .order("nome")
        .then(({ data, error }) => {
          if (error) throw new Error(error.message);
          return data ?? [];
        }),
    ]);
    return NextResponse.json({ artilheiros, jogadores });
  } catch (e) {
    return handleApiError(e);
  }
}

const putSchema = z.object({
  jogadorIds: z.array(z.number().int().positive()),
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const parsed = putSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

    const supabase = createAdminClient();

    const { error: delError } = await supabase
      .from("artilheiro_oficial")
      .delete()
      .gte("id", 0);
    if (delError) throw new Error(delError.message);

    if (parsed.data.jogadorIds.length > 0) {
      const rows = parsed.data.jogadorIds.map((jogador_id) => ({ jogador_id }));
      const { error } = await supabase
        .from("artilheiro_oficial")
        .insert(rows);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
