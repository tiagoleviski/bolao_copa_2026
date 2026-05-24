"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verificarAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false, supabase };

  const { data: perfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return { user, isAdmin: perfil?.role === "admin", supabase };
}

export async function convidarUsuario(email: string) {
  const { isAdmin } = await verificarAdmin();
  if (!isAdmin) return { error: "Acesso negado." };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/auth/nova-senha`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function promoverAdmin(userId: string) {
  const { isAdmin } = await verificarAdmin();
  if (!isAdmin) return { error: "Acesso negado." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("perfis")
    .update({ role: "admin" })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function rebaixarUsuario(userId: string) {
  const { user, isAdmin } = await verificarAdmin();
  if (!isAdmin) return { error: "Acesso negado." };
  if (user?.id === userId)
    return { error: "Você não pode remover seu próprio acesso admin." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("perfis")
    .update({ role: "user" })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}
