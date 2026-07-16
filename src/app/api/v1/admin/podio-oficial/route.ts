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
      .from("podio_oficial")
      .select("*")
      .order("posicao");
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (e) {
    return handleApiError(e);
  }
}

const putSchema = z.object({
  podio: z.array(
    z.object({
      posicao: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      pais_id: z.number().int().positive(),
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

    const { error: delError } = await supabase
      .from("podio_oficial")
      .delete()
      .gte("id", 0);
    if (delError) throw new Error(delError.message);

    if (parsed.data.podio.length > 0) {
      const { error } = await supabase
        .from("podio_oficial")
        .insert(parsed.data.podio);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
