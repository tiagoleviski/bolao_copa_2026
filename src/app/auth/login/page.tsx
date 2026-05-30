"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useLogin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const login = useLogin();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, senha },
      { onError: () => toast.error("Email ou senha incorretos.") },
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white mb-2">
            BOLÃO RES COPA 2026
          </h1>
          <p className="text-muted-foreground text-sm">
            Entre para fazer seus palpites
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Senha</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-[#004b87] text-white font-semibold h-11"
          >
            {login.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            href="/auth/recuperar-senha"
            className="text-muted-foreground hover:text-foreground"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </div>
  );
}
