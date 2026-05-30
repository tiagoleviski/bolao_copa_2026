import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getJogadores,
  getApostaArtilheiro,
  salvarApostaArtilheiro,
  deletarApostaArtilheiro,
} from "@/lib/services/artilheiro.service";

const postSchema = z.object({
  jogadorId: z.number().int().positive(),
});

export async function GET() {
  try {
    const user = await requireSession();
    const [jogadores, apostaAtual] = await Promise.all([
      getJogadores(),
      getApostaArtilheiro(user.id),
    ]);
    return NextResponse.json({ jogadores, apostaAtual });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE() {
  try {
    const user = await requireSession();
    await deletarApostaArtilheiro(user.id);
    return NextResponse.json({ success: true });
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
    await salvarApostaArtilheiro(user.id, parsed.data.jogadorId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
