"use client";

import { useEffect, useRef } from "react";
import { useHandleInvite } from "@/hooks/useAuth";

export default function InvitePage() {
  const handleInvite = useHandleInvite();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    handleInvite.mutate();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Verificando convite...</p>
    </div>
  );
}
