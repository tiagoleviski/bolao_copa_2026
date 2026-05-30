import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getPodioData, salvarApostaPodio } from "@/lib/services/podio.service";

export async function GET() {
  try {
    const user = await requireSession();
    const data = await getPodioData(user.id);
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireSession();
    const previsoes: Array<{ posicao: 1 | 2 | 3; pais_id: number }> =
      await req.json();
    await salvarApostaPodio(user.id, previsoes);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
