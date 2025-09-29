"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "@/modules/i18n/LanguageProvider";
import { fetchJson } from "@/modules/shared/http";

interface CustomerRecord {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  _count?: {
    projects?: number;
  };
  createdAt?: string;
}

interface CustomerFormState {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

const emptyForm: CustomerFormState = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export default function CustomersPage() {
  const translations = useTranslations();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const tableHeaders = translations.customers.table.headers;

  useEffect(() => {
    reload();
  }, []);

  async function reload() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJson<CustomerRecord[]>("/api/customers");
      setCustomers(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(record: CustomerRecord) {
    setEditingId(record.id);
    setForm({
      name: record.name ?? "",
      contactPerson: record.contactPerson ?? "",
      email: record.email ?? "",
      phone: record.phone ?? "",
      address: record.address ?? "",
      notes: record.notes ?? "",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError(translations.customers.form.name);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = mapFormToPayload(form);
      if (editingId) {
        await fetchJson(`/api/customers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson("/api/customers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setForm(emptyForm);
      setEditingId(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record: CustomerRecord) {
    if (!record.id) return;
    const confirmed = window.confirm(translations.common.confirmDelete);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await fetchJson(`/api/customers/${record.id}`, { method: "DELETE" });
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
    ? translations.customers.form.submitUpdate
    : translations.customers.form.submitCreate;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-white">{translations.customers.title}</h2>
          <p className="text-sm text-slate-300">{translations.customers.description}</p>
        </div>
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {translations.customers.form.name}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.customers.form.contactPerson}
                </label>
                <input
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.customers.form.phone}
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.customers.form.email}
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  type="email"
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.customers.form.address}
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {translations.customers.form.notes}
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
              />
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

      <div className="rounded-lg border border-white/10 bg-slate-900/50">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-4 py-3">{tableHeaders.customer}</th>
              <th className="px-4 py-3">{tableHeaders.contact}</th>
              <th className="px-4 py-3">{tableHeaders.phone}</th>
              <th className="px-4 py-3">{tableHeaders.projects}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                  {translations.common.loading}
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">
                  {translations.common.empty}
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{customer.name}</div>
                    {customer.address ? (
                      <div className="text-xs text-slate-400">{customer.address}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div>{customer.contactPerson}</div>
                    {customer.email ? (
                      <div className="text-xs text-slate-400">{customer.email}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-slate-200">
                      {(customer._count?.projects ?? 0).toString()} {translations.customers.table.activeSuffix}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(customer)}
                        className="rounded-md border border-white/20 px-3 py-1 text-white transition hover:border-sky-300/50"
                      >
                        {translations.common.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(customer)}
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

      <div className="rounded-lg border border-dashed border-white/20 bg-slate-900/30 p-4 text-xs text-slate-300">
        <p className="font-semibold text-slate-200">{translations.customers.nextStepsTitle}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {translations.customers.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function mapFormToPayload(form: CustomerFormState) {
  return {
    name: form.name.trim(),
    contactPerson: optionalString(form.contactPerson),
    email: optionalString(form.email),
    phone: optionalString(form.phone),
    address: optionalString(form.address),
    notes: optionalString(form.notes),
  };
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

