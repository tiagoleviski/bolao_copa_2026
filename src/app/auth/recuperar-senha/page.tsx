"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useResetPassword, useVerifyOtp } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const resetPassword = useResetPassword();
  const verifyOtp = useVerifyOtp();

  function handleEnviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    resetPassword.mutate(email, {
      onSuccess: () => setEnviado(true),
      onError: (err) => toast.error(err.message),
    });
  }

  function handleVerificarCodigo(e: React.FormEvent) {
    e.preventDefault();
    verifyOtp.mutate(
      { email, token: codigo },
      {
        onSuccess: () => router.push("/auth/nova-senha"),
        onError: (err) => toast.error(err.message),
      },
    );
  }

  if (enviado) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="font-display text-3xl text-white">
              VERIFIQUE SEU EMAIL
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Se <span className="text-foreground">{email}</span> estiver
              cadastrado, você receberá um código de recuperação
            </p>
          </div>

          <form onSubmit={handleVerificarCodigo} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Código de recuperação
              </label>
              <Input
                type="text"
                placeholder="Digite o código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                required
                autoComplete="one-time-code"
              />
            </div>

            <Button
              type="submit"
              disabled={verifyOtp.isPending}
              className="w-full bg-[#004b87] text-white font-semibold h-11"
            >
              {verifyOtp.isPending ? "Verificando..." : "Verificar código"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => {
                setEnviado(false);
                setCodigo("");
              }}
              className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              Reenviar código
            </button>
            <p>
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Voltar para o login
              </Link>
            </p>
          </div>
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
            Enviaremos um código para o seu email
          </p>
        </div>

        <form onSubmit={handleEnviarCodigo} className="space-y-4">
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
            disabled={resetPassword.isPending}
            className="w-full bg-[#004b87] text-white font-semibold h-11"
          >
            {resetPassword.isPending ? "Enviando..." : "Enviar código"}
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
