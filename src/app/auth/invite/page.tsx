"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useHandleInvite } from "@/hooks/useAuth";

const ERROR_MESSAGES: Record<string, string> = {
  otp_expired:
    "O link do convite expirou. Peça um novo convite ao administrador.",
  auth_callback_error:
    "Não foi possível verificar o convite. Tente novamente ou peça um novo convite ao administrador.",
};

const DEFAULT_ERROR_MESSAGE =
  "Ocorreu um erro ao processar o convite. Peça um novo convite ao administrador.";

export default function InvitePage() {
  const handleInvite = useHandleInvite();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    handleInvite.mutate();
  }, []);

  if (handleInvite.isError) {
    const errorCode =
      (handleInvite.error as any)?.code || handleInvite.error?.message;
    const message = ERROR_MESSAGES[errorCode] || DEFAULT_ERROR_MESSAGE;

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="font-display text-3xl text-white mb-4">
            CONVITE INVÁLIDO
          </h1>
          <p className="text-muted-foreground text-sm mb-6">{message}</p>
          <Link
            href="/auth/login"
            className="inline-block w-full bg-[#004b87] text-white font-semibold h-11 leading-[2.75rem] rounded-md text-center text-sm"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Verificando convite...</p>
    </div>
  );
}
