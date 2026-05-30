import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { promoverAdmin, rebaixarUsuario } from "@/lib/services/admin.service";

const postSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const requester = await requireAdmin();
    const { id: userId } = await params;
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    if (parsed.data.role === "admin") {
      await promoverAdmin(userId);
    } else {
      await rebaixarUsuario(userId, requester.id);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
