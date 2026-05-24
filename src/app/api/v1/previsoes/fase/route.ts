import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { salvarPrevisaoFase } from "@/lib/services/previsoes.service";
import { FASES_ORDEM } from "@/lib/constants";
import type { FaseClassificacao } from "@/lib/types";

const postSchema = z.object({
  fase: z.enum(FASES_ORDEM as [FaseClassificacao, ...FaseClassificacao[]]),
  paisIds: z.array(z.number().int().positive()),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    await salvarPrevisaoFase(user.id, parsed.data.fase, parsed.data.paisIds);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
