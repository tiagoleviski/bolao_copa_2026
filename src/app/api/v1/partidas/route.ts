import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getPartidasComTimes } from "@/lib/services/partidas.service";

export async function GET() {
  try {
    await requireSession();
    const data = await getPartidasComTimes();
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
