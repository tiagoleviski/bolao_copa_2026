import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getAuditoriaData } from "@/lib/services/auditoria.service";

export async function GET() {
  try {
    await requireSession();
    const data = await getAuditoriaData();
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
