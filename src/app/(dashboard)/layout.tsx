"use client";

import { useTranslations } from "@/modules/i18n/LanguageProvider";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./_components/LanguageSwitcher";
import { SidebarNav } from "./_components/SidebarNav";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const translations = useTranslations();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              {translations.layout.brand}
            </p>
            <h1 className="text-xl font-semibold text-white">
              {translations.layout.suiteTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300">
              {translations.layout.suiteTagline}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row">
        <aside className="w-full shrink-0 md:w-56">
          <SidebarNav />
        </aside>
        <main className="flex-1">
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-6 shadow-xl shadow-black/40">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

