import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function enviarCodigoRecuperacao(email: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("perfis")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!data) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/auth/nova-senha`,
  });
}
