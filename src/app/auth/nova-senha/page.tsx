"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCurrentUser, useSetPassword } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NovaSenhaPage() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const setPassword = useSetPassword();

  const nomeExistente = currentUser?.user_metadata?.nome_completo || "";
  const isRecuperacao = !!nomeExistente;

  useEffect(() => {
    if (nomeExistente) {
      setNome(nomeExistente);
    }
  }, [nomeExistente]);

  function handleNovaSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senha !== confirmacao) {
      toast.error("As senhas não conferem.");
      return;
    }
    if (senha.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setPassword.mutate(
      { nome, senha },
      {
        onSuccess: () => {
          toast.success(
            isRecuperacao
              ? "Senha atualizada com sucesso!"
              : "Conta criada com sucesso!",
          );
          router.push("/palpites");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl text-white mb-2">
            {isRecuperacao ? "NOVA SENHA" : "CRIAR CONTA"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isRecuperacao
              ? "Defina sua nova senha"
              : "Complete seu cadastro para participar do bolão"}
          </p>
        </div>

        <form onSubmit={handleNovaSenha} className="space-y-4">
          {!isRecuperacao && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome completo <span className="text-red-500">*</span>
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
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nova senha
            </label>
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
            disabled={setPassword.isPending}
            className="w-full bg-[#004b87] text-white font-semibold h-11"
          >
            {setPassword.isPending
              ? "Salvando..."
              : isRecuperacao
                ? "Atualizar senha"
                : "Entrar no bolão"}
          </Button>
        </form>
      </div>
    </div>
  );
}
