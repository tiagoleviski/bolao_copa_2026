"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/nova-senha`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setEnviado(true);
    }

    setLoading(false);
  }

  if (enviado) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 w-full max-w-md text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h2 className="font-display text-3xl text-white">
            EMAIL ENVIADO
          </h2>
          <p className="text-muted-foreground">
            Verifique sua caixa de entrada e clique no link para redefinir sua
            senha.
          </p>
          <Link href="/auth/login" className="block">
            <Button variant="outline" className="w-full">
              Voltar para o login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white mb-2">
            RECUPERAR SENHA
          </h1>
          <p className="text-muted-foreground text-sm">
            Enviaremos um link para o seu email
          </p>
        </div>

        <form onSubmit={handleRecuperar} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004b87] text-white font-semibold h-11"
          >
            {loading ? "Enviando..." : "Enviar link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/auth/login"
            className="text-purple-400 hover:text-purple-300"
          >
            ← Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
