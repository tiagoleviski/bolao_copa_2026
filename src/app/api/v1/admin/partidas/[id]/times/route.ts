import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { atualizarTimesPartida } from "@/lib/services/partidas.service";

const patchSchema = z.object({
  timeAId: z.number().int().positive().nullable(),
  timeBId: z.number().int().positive().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const partidaId = parseInt(id, 10);
    if (isNaN(partidaId))
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    await atualizarTimesPartida(
      partidaId,
      parsed.data.timeAId,
      parsed.data.timeBId,
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
