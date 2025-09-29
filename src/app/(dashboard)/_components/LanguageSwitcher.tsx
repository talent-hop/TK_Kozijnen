"use client";

import {
  supportedLanguages,
  useLanguage,
  useTranslations,
  type Language,
} from "@/modules/i18n/LanguageProvider";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const translations = useTranslations();
  const selectId = "dashboard-language";
  const labelText = translations.languageSwitcher.label;

  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <label htmlFor={selectId} className="sr-only">
        {labelText}
      </label>
      <span className="hidden uppercase tracking-[0.3em] text-slate-400 sm:inline">
        {labelText}
      </span>
      <select
        id={selectId}
        aria-label={labelText}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="rounded-md border border-white/10 bg-slate-900/80 px-3 py-1 text-xs font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        {supportedLanguages.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
