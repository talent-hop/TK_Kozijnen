"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "@/modules/i18n/LanguageProvider";
import { fetchJson } from "@/modules/shared/http";

interface InventoryRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string | null;
  minQuantity?: number | null;
  notes?: string | null;
}

interface InventoryFormState {
  sku: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  location: string;
  minQuantity: string;
  notes: string;
}

interface WindowFrameRecord {
  id: string;
  projectId: string;
  label: string;
  status: string;
  widthMm: number;
  heightMm: number;
  project?: {
    id: string;
    name: string;
  } | null;
}

const emptyInventoryForm: InventoryFormState = {
  sku: "",
  name: "",
  category: "",
  quantity: "0",
  unit: "",
  location: "",
  minQuantity: "0",
  notes: "",
};

export default function InventoryPage() {
  const translations = useTranslations();
  const [items, setItems] = useState<InventoryRecord[]>([]);
  const [frames, setFrames] = useState<WindowFrameRecord[]>([]);
  const [form, setForm] = useState<InventoryFormState>(emptyInventoryForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reload();
  }, []);

  async function reload() {
    try {
      setLoading(true);
      setError(null);
      const [inventory, windowFrames] = await Promise.all([
        fetchJson<InventoryRecord[]>("/api/inventory"),
        fetchJson<WindowFrameRecord[]>("/api/window-frames"),
      ]);
      setItems(inventory ?? []);
      setFrames(windowFrames ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setForm(emptyInventoryForm);
    setEditingId(null);
  }

  function startEdit(record: InventoryRecord) {
    setEditingId(record.id);
    setForm({
      sku: record.sku ?? "",
      name: record.name ?? "",
      category: record.category ?? "",
      quantity: String(record.quantity ?? 0),
      unit: record.unit ?? "",
      location: record.location ?? "",
      minQuantity: String(record.minQuantity ?? 0),
      notes: record.notes ?? "",
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.sku.trim() || !form.name.trim() || !form.category.trim() || !form.unit.trim()) {
      setError(translations.inventory.form.name);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = mapInventoryFormToPayload(form);
      if (editingId) {
        await fetchJson(`/api/inventory/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson("/api/inventory", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setForm(emptyInventoryForm);
      setEditingId(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(record: InventoryRecord) {
    const confirmed = window.confirm(translations.common.confirmDelete);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await fetchJson(`/api/inventory/${record.id}`, { method: "DELETE" });
      if (editingId === record.id) {
        startCreate();
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  const submitLabel = editingId
    ? translations.inventory.form.submitUpdate
    : translations.inventory.form.submitCreate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-white">{translations.inventory.title}</h2>
          <p className="text-sm text-slate-300">{translations.inventory.description}</p>
        </div>
        <div className="w-full max-w-xl rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.inventory.form.sku}
                </label>
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.inventory.form.name}
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.inventory.form.category}
                </label>
                <input
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.inventory.form.unit}
                </label>
                <input
                  name="unit"
                  value={form.unit}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.inventory.form.quantity}
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.inventory.form.minQuantity}
                </label>
                <input
                  type="number"
                  name="minQuantity"
                  value={form.minQuantity}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.inventory.form.location}
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.inventory.form.notes}
                </label>
                <input
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
            {error ? <p className="text-xs text-rose-300">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? translations.common.saving : submitLabel}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={startCreate}
                  className="rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  {translations.common.cancel}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      <section className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          {translations.inventory.materialsTitle}
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-4 py-3">{translations.inventory.form.sku}</th>
                <th className="px-4 py-3">{translations.inventory.form.name}</th>
                <th className="px-4 py-3">{translations.inventory.form.category}</th>
                <th className="px-4 py-3">{translations.inventory.form.quantity}</th>
                <th className="px-4 py-3">{translations.inventory.form.location}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                    {translations.common.loading}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                    {translations.common.empty}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-white">{item.sku}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{item.name}</div>
                      {item.notes ? (
                        <div className="text-xs text-slate-400">{item.notes}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold text-white">{item.quantity}</span>
                        <span className="text-slate-400">{item.unit}</span>
                      </span>
                      {typeof item.minQuantity === "number" ? (
                        <div className="text-[11px] text-slate-400">
                          min. {item.minQuantity}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{item.location ?? "--"}</td>
                    <td className="px-4 py-3 text-right text-xs">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-md border border-white/20 px-3 py-1 text-white transition hover:border-sky-300/50"
                        >
                          {translations.common.edit}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-md border border-rose-400/40 px-3 py-1 text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                        >
                          {translations.common.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          {translations.inventory.framesTitle}
        </h3>
        <div className="mt-4 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
          {frames.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-400">
              {translations.common.empty}
            </div>
          ) : (
            frames.map((frame) => (
              <div key={frame.id} className="rounded-md border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{frame.project?.name ?? frame.projectId}</p>
                    <p className="text-base font-semibold text-white">{frame.label}</p>
                    <p className="text-xs text-slate-400">
                      {frame.widthMm} x {frame.heightMm} mm
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-200">
                    {translations.statuses.windowFrames[frame.status] ?? frame.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="rounded-lg border border-dashed border-white/20 bg-slate-900/30 p-4 text-xs text-slate-300">
        <p className="font-semibold text-slate-200">{translations.inventory.implementationHintsTitle}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {translations.inventory.implementationHints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function mapInventoryFormToPayload(form: InventoryFormState) {
  return {
    sku: form.sku.trim(),
    name: form.name.trim(),
    category: form.category.trim(),
    quantity: parseInteger(form.quantity),
    unit: form.unit.trim(),
    location: optionalString(form.location),
    minQuantity: parseInteger(form.minQuantity),
    notes: optionalString(form.notes),
  };
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseInteger(value: string) {
  const numberValue = Number.parseInt(value, 10);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : undefined;
}

