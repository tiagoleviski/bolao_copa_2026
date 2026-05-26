"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NovaSenhaPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleNovaSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senha !== confirmacao) {
      toast.error("As senhas não conferem.");
      return;
    }
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);

    const supabase = createClient();

    const { data: userData, error: userError } = await supabase.auth.updateUser(
      { password: senha, data: { nome_completo: nome } },
    );

    if (userError) {
      toast.error(userError.message);
      setLoading(false);
      return;
    }

    if (userData.user && nome) {
      await supabase
        .from("perfis")
        .update({ nome_completo: nome })
        .eq("id", userData.user.id);
    }

    toast.success("Conta criada com sucesso!");
    router.push("/palpites");

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white mb-2">CRIAR CONTA</h1>
          <p className="text-muted-foreground text-sm">
            Complete seu cadastro para participar do bolão
          </p>
        </div>

        <form onSubmit={handleNovaSenha} className="space-y-4">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Confirmar senha
            </label>
            <Input
              type="password"
              placeholder="Repita a senha"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#004b87] text-white font-semibold h-11"
          >
            {loading ? "Salvando..." : "Entrar no bolão"}
          </Button>
        </form>
      </div>
    </div>
  );
}
