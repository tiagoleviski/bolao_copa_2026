import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome_completo, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const nomeUsuario =
    perfil?.nome_completo ??
    user.user_metadata?.nome_completo ??
    user.email ??
    "Usuário";
  const emailUsuario = perfil?.email ?? user.email ?? "";
  const isAdmin = perfil?.role === "admin";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        nomeUsuario={nomeUsuario}
        emailUsuario={emailUsuario}
        isAdmin={isAdmin}
      />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
