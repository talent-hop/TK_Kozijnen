"use client";

import { useTranslations } from "@/modules/i18n/LanguageProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", key: "dashboard" as const },
  { href: "/customers", key: "customers" as const },
  { href: "/projects", key: "projects" as const },
  { href: "/inventory", key: "inventory" as const },
  { href: "/sales", key: "sales" as const },
  { href: "/drawings", key: "drawings" as const },
];

export function SidebarNav() {
  const pathname = usePathname();
  const translations = useTranslations();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const label = translations.sidebar[item.key];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
