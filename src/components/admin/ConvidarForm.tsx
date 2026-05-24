"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { convidarUsuario } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ConvidarForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await convidarUsuario(email);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Convite enviado para ${email}`);
        setEmail("");
      }
    });
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
        disabled={isPending}
        className="gradient-copa text-white font-semibold flex-shrink-0"
      >
        {isPending ? "Enviando..." : "Enviar convite"}
      </Button>
    </form>
  );
}
