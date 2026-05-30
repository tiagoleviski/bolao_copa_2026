import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { atualizarResultadoPartida } from "@/lib/services/partidas.service";

const postSchema = z.object({
  golsA: z.number().int().min(0).max(99),
  golsB: z.number().int().min(0).max(99),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const partidaId = parseInt(id, 10);
    if (isNaN(partidaId))
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    await atualizarResultadoPartida(
      partidaId,
      parsed.data.golsA,
      parsed.data.golsB,
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
