import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getChecagemData } from "@/lib/services/checagem.service";

export async function GET() {
  try {
    await requireAdmin();
    const data = await getChecagemData();
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
