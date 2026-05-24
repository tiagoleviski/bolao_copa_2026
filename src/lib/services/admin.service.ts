import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getPerfis() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome_completo, email, role")
    .order("nome_completo");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function convidarUsuario(email: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/auth/nova-senha`,
  });
  if (error) throw new Error(error.message);
}

export async function promoverAdmin(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("perfis")
    .update({ role: "admin" })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function rebaixarUsuario(userId: string, requesterId: string) {
  if (userId === requesterId)
    throw new Error("Você não pode remover seu próprio acesso admin.");
  const supabase = await createClient();
  const { error } = await supabase
    .from("perfis")
    .update({ role: "user" })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}
