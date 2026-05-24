import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { salvarPosicaoEspecifica } from "@/lib/services/previsoes.service";
import { FASES_ORDEM } from "@/lib/constants";
import type { FaseClassificacao } from "@/lib/types";

const postSchema = z.object({
  fase: z.enum(FASES_ORDEM as [FaseClassificacao, ...FaseClassificacao[]]),
  paisId: z.number().int().positive().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    await salvarPosicaoEspecifica(
      user.id,
      parsed.data.fase,
      parsed.data.paisId,
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
