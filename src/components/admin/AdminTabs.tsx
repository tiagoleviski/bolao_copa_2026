"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Placar", href: "/admin" },
  { label: "Posição no Grupo", href: "/admin/posicoes-grupo" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b border-white/10 mb-6">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
              ${
                active
                  ? "bg-white/10 text-white border-b-2 border-purple-400"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
