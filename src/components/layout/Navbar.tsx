"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavbarProps {
  nomeUsuario: string;
  emailUsuario: string;
  isAdmin: boolean;
}

export function Navbar({ nomeUsuario, emailUsuario, isAdmin }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Até logo!");
    router.push("/auth/login");
    router.refresh();
  }

  const initials = nomeUsuario
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-[#004b87] border-b border-[#003d70]">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link href="/palpites" className="flex items-center gap-2">
          <span className="font-display text-2xl text-white">
            Bolão RES Copa 2026
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/palpites">Palpites</NavLink>
          <NavLink href="/chaveamento">Chaveamento</NavLink>
          <NavLink href="/artilheiro">Artilheiro</NavLink>
          <NavLink href="/grupos">Grupos</NavLink>
          <NavLink href="/ranking">Ranking</NavLink>
          <NavLink href="/regras">Regras</NavLink>
          {isAdmin && (
            <>
              <NavLink href="/admin">Resultados</NavLink>
              <NavLink href="/admin/usuarios">Usuários</NavLink>
            </>
          )}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm text-white/90 max-w-32 truncate">
              {nomeUsuario}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              disabled
              className="text-muted-foreground text-xs"
            >
              {emailUsuario}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/regras")}
              className="cursor-pointer"
            >
              Regras
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 cursor-pointer"
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  );
}
