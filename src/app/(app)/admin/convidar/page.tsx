"use client";

import { toast } from "sonner";
import { useAdminUsuarios, useAlterarRole } from "@/hooks/useAdmin";
import { ConvidarForm } from "@/components/admin/ConvidarForm";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ConvidarPage() {
  const { data: usuarios, isPending } = useAdminUsuarios();
  const alterarRole = useAlterarRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  if (isPending) return null;

  function handleToggleRole(userId: string, roleAtual: string) {
    const novoRole = roleAtual === "admin" ? "user" : "admin";
    alterarRole.mutate(
      { userId, role: novoRole as "admin" | "user" },
      {
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-4xl text-white">CONVIDAR</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Envie um link de convite para um novo participante
        </p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-foreground/80">
          NOVO CONVITE
        </h2>
        <p className="text-sm text-muted-foreground">
          A pessoa receberá um email para criar sua senha e acessar o bolão.
        </p>
        <ConvidarForm />
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl text-foreground/80">
          PARTICIPANTES
        </h2>
        <div className="space-y-2">
          {(usuarios ?? []).map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {u.nome_completo}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {u.email}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  u.role === "admin"
                    ? "bg-purple-600/30 text-purple-300"
                    : "bg-white/10 text-muted-foreground"
                }`}
              >
                {u.role}
              </span>
              {u.id !== currentUserId && (
                <button
                  onClick={() => handleToggleRole(u.id, u.role)}
                  disabled={alterarRole.isPending}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {u.role === "admin" ? "← user" : "→ admin"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
