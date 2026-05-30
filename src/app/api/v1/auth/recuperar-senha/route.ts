import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/lib/api/error-handler";
import { enviarCodigoRecuperacao } from "@/lib/services/auth.service";

const postSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });

    await enviarCodigoRecuperacao(parsed.data.email);

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
