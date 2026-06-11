import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getSimuladorData } from "@/lib/services/simulador.service";

export async function GET() {
  try {
    await requireSession();
    const data = await getSimuladorData();
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
