"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useConvidarUsuario } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ConvidarForm() {
  const [email, setEmail] = useState("");
  const convidar = useConvidarUsuario();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    convidar.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success(`Convite enviado para ${email}`);
          setEmail("");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="email"
        placeholder="email@colega.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={convidar.isPending}
        className="bg-[#004b87] text-white font-semibold flex-shrink-0 cursor-pointer"
      >
        {convidar.isPending ? "Enviando..." : "Enviar convite"}
      </Button>
    </form>
  );
}
