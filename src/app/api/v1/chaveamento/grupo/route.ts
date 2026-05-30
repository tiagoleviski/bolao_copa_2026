import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import {
  removerPrevisaoGrupo,
  salvarPrevisaoGrupo,
  salvarPrevisoesGrupo,
} from "@/lib/services/chaveamento.service";

const postSchema = z.object({
  paisId: z.number().int().positive(),
  posicao: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
    .nullable(),
  terceiroAvanca: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

    const { paisId, posicao, terceiroAvanca } = parsed.data;

    if (posicao === null) {
      await removerPrevisaoGrupo(user.id, paisId);
    } else {
      await salvarPrevisaoGrupo(user.id, paisId, posicao, terceiroAvanca);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}

const putSchema = z.array(
  z.object({
    pais_id: z.number().int().positive(),
    posicao: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    terceiro_avanca: z.boolean(),
  }),
);

export async function PUT(req: NextRequest) {
  try {
    const user = await requireSession();
    const parsed = putSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

    await salvarPrevisoesGrupo(user.id, parsed.data);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
