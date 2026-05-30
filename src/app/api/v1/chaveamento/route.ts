import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getChaveamentoData } from "@/lib/services/chaveamento.service";

export async function GET() {
  try {
    const user = await requireSession();
    const data = await getChaveamentoData(user.id);
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
