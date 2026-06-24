import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminTabs } from "@/components/admin/AdminTabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabase
    .from("perfis")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.role !== "admin") redirect("/palpites");

  return (
    <>
      <AdminTabs />
      {children}
    </>
  );
}
