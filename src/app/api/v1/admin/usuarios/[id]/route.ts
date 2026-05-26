import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { deletarUsuario } from "@/lib/services/admin.service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const requester = await requireAdmin();
    const { id: userId } = await params;
    await deletarUsuario(userId, requester.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
