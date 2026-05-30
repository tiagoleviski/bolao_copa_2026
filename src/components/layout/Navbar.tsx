"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";
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
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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

  const navLinks = [
    { href: "/palpites", label: "Palpites" },
    { href: "/chaveamento", label: "Chaveamento" },
    { href: "/artilheiro", label: "Artilheiro" },
    { href: "/grupos", label: "Grupos" },
    { href: "/ranking", label: "Ranking" },
    { href: "/auditoria", label: "Auditoria" },
    { href: "/regras", label: "Regras" },
    ...(isAdmin
      ? [
          { href: "/admin", label: "Resultados" },
          { href: "/admin/usuarios", label: "Usuários" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#004b87] border-b border-[#003d70]">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <Link href="/palpites" className="flex items-center gap-2">
          <span className="font-display text-2xl text-white">
            Bolão RES Copa 2026
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-white bg-white/15"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Menu de navegação"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block text-sm text-white/90 max-w-32 truncate">
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
                onClick={handleLogout}
                className="text-red-400 cursor-pointer"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-[#003d70] px-4 py-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-white bg-white/15"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
