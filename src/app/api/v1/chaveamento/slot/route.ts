import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import {
  limparChaveamento,
  salvarPrevisaoSlot,
} from "@/lib/services/chaveamento.service";
import type { FaseChaveamento } from "@/lib/types";

const FASES_CHAVEAMENTO: FaseChaveamento[] = [
  "Segunda Fase",
  "Oitavas de Final",
  "Quartas de Final",
  "Semifinal",
  "Terceiro Lugar",
  "Final",
];

const postSchema = z.object({
  fase: z.enum(FASES_CHAVEAMENTO as [FaseChaveamento, ...FaseChaveamento[]]),
  slot: z.number().int().positive(),
  paisId: z.number().int().positive().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession();
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

    const { fase, slot, paisId } = parsed.data;
    await salvarPrevisaoSlot(user.id, fase, slot, paisId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  void req;
  try {
    const user = await requireSession();
    await limparChaveamento(user.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
