import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { getPerfis } from "@/lib/services/admin.service";

export async function GET() {
  try {
    await requireAdmin();
    const data = await getPerfis();
    return NextResponse.json(data);
  } catch (e) {
    return handleApiError(e);
  }
}
