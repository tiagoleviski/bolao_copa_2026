import { createClient } from "@/lib/supabase/server";
import { AuthError } from "@/lib/api/error-handler";
import type { User } from "@supabase/supabase-js";

export async function requireSession(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Não autenticado.", 401);
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireSession();
  const supabase = await createClient();
  const { data: perfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (perfil?.role !== "admin") throw new AuthError("Acesso negado.", 403);
  return user;
}
