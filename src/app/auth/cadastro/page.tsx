import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CadastroPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-8 w-full max-w-md text-center space-y-4">
        <div className="text-5xl">🔒</div>
        <h2 className="font-display text-3xl text-white">ACESSO RESTRITO</h2>
        <p className="text-muted-foreground">
          O Bolão Copa 2026 é um sistema interno. O cadastro é feito apenas por
          convite — você receberá um email com o link de acesso após confirmar
          sua participação.
        </p>
        <p className="text-muted-foreground text-sm">
          Se você já foi convidado, verifique sua caixa de entrada e siga o link
          recebido.
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
