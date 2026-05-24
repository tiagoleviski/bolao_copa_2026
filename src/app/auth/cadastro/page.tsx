"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome_completo: nome } },
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
            CONFIRME SEU EMAIL
          </h2>
          <p className="text-muted-foreground">
            Enviamos um link de confirmação para{" "}
            <span className="text-foreground font-medium">{email}</span>.
            Verifique sua caixa de entrada.
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
            CRIAR CONTA
          </h1>
          <p className="text-muted-foreground text-sm">
            Cadastre-se para participar do bolão
          </p>
        </div>

        <form onSubmit={handleCadastro} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nome completo
            </label>
            <Input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
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
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004b87] text-white font-semibold h-11"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link
            href="/auth/login"
            className="text-purple-400 hover:text-purple-300"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
