import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getPaises } from "@/lib/services/artilheiro.service";
import { getPrevisoes } from "@/lib/services/previsoes.service";

export async function GET() {
  try {
    const user = await requireSession();
    const [paises, previsoes] = await Promise.all([
      getPaises(),
      getPrevisoes(user.id),
    ]);
    return NextResponse.json({ paises, previsoes });
  } catch (e) {
    return handleApiError(e);
  }
}
