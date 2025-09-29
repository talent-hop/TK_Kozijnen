"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "@/modules/i18n/LanguageProvider";
import { fetchJson } from "@/modules/shared/http";
import Link from "next/link";

type SummaryMetrics = {
  projects: number;
  inventory: number;
  quotes: number;
};

type SummaryCard = ReturnType<typeof useTranslations>["dashboard"]["summaryCards"][number];

export default function DashboardPage() {
  const translations = useTranslations();
  const [metrics, setMetrics] = useState<SummaryMetrics>({
    projects: 0,
    inventory: 0,
    quotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [projects, inventory, invoices] = await Promise.all([
          fetchJson<Array<{ id: string }>>("/api/projects"),
          fetchJson<Array<{ id: string }>>("/api/inventory"),
          fetchJson<Array<{ id: string }>>("/api/invoices"),
        ]);
        if (!mounted) return;
        setMetrics({
          projects: projects?.length ?? 0,
          inventory: inventory?.length ?? 0,
          quotes: invoices?.length ?? 0,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const summaryCards = useMemo(() => buildSummaryCards(translations.dashboard.summaryCards, metrics), [
    translations.dashboard.summaryCards,
    metrics,
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-6 transition hover:border-white/20 hover:from-slate-800/80 hover:to-slate-900/60"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {card.name}
            </p>
            <p className="mt-4 text-3xl font-semibold text-white">
              {loading ? "--" : card.value}
            </p>
            <p className="mt-3 text-sm text-slate-300">{card.description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-sky-300">
              {translations.dashboard.viewDetails}
              <span aria-hidden className="transition group-hover:translate-x-1">&gt;</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">
            {translations.dashboard.productionPipeline.title}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {translations.dashboard.productionPipeline.description}
          </p>
          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            {translations.dashboard.productionPipeline.bullets.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span aria-hidden className="mt-1 inline-block h-2 w-2 rounded-full bg-sky-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">
            {translations.dashboard.quickActionsTitle}
          </h2>
          {error ? (
            <p className="mt-4 text-sm text-rose-300">{error}</p>
          ) : null}
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {translations.dashboard.quickLinks.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className="flex flex-col rounded-lg border border-white/5 bg-white/5 p-4 transition hover:border-sky-300/40 hover:bg-sky-400/10"
                >
                  <span className="text-sm font-semibold text-white">
                    {link.title}
                  </span>
                  <span className="mt-1 text-xs text-slate-300">
                    {link.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function buildSummaryCards(cards: SummaryCard[], metrics: SummaryMetrics) {
  return cards.map((card) => ({
    ...card,
    value: metrics[card.metric],
  }));
}
