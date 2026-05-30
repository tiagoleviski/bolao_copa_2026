import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getApostasDoUsuario,
  salvarAposta,
} from "@/lib/services/apostas.service";

const postSchema = z.object({
  partidaId: z.number().int().positive(),
  golsTimeA: z.number().int().min(0).max(99),
  golsTimeB: z.number().int().min(0).max(99),
});

export async function GET() {
  try {
    const user = await requireSession();
    const data = await getApostasDoUsuario(user.id);
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const { partidaId, golsTimeA, golsTimeB } = parsed.data;
    await salvarAposta(user.id, partidaId, golsTimeA, golsTimeB);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
