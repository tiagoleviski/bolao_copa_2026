import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/error-handler";
import { convidarUsuario } from "@/lib/services/admin.service";

const postSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const parsed = postSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    await convidarUsuario(parsed.data.email);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
