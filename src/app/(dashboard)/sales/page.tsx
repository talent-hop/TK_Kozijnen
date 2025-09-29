"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "@/modules/i18n/LanguageProvider";
import { fetchJson } from "@/modules/shared/http";
import {
  currencyValues,
  invoiceStatusValues,
  invoiceTypeValues,
} from "@/modules/shared/constants";

interface InvoiceRecord {
  id: string;
  number: string;
  customerId: string;
  projectId?: string | null;
  status: string;
  type: string;
  currency: string;
  totalAmount: number;
  issueDate: string;
  dueDate?: string | null;
  notes?: string | null;
  customer?: {
    id: string;
    name: string;
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface InvoiceFormState {
  number: string;
  customerId: string;
  projectId: string;
  status: string;
  type: string;
  totalAmount: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  currency: string;
}

interface CustomerOption {
  id: string;
  name: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

const emptyForm: InvoiceFormState = {
  number: "",
  customerId: "",
  projectId: "",
  status: invoiceStatusValues[0],
  type: invoiceTypeValues[0],
  totalAmount: "0",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  notes: "",
  currency: currencyValues[0],
};

export default function SalesPage() {
  const translations = useTranslations();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [form, setForm] = useState<InvoiceFormState>(emptyForm);
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
      const [invoiceData, customerData, projectData] = await Promise.all([
        fetchJson<InvoiceRecord[]>("/api/invoices"),
        fetchJson<CustomerOption[]>("/api/customers"),
        fetchJson<ProjectOption[]>("/api/projects"),
      ]);
      setInvoices(invoiceData ?? []);
      setCustomers((customerData ?? []).map((cust) => ({ id: cust.id, name: cust.name })));
      setProjects((projectData ?? []).map((project) => ({ id: project.id, name: project.name })));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setForm({ ...emptyForm, issueDate: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
  }

  function startEdit(record: InvoiceRecord) {
    setEditingId(record.id);
    setForm({
      number: record.number ?? "",
      customerId: record.customerId,
      projectId: record.projectId ?? "",
      status: record.status,
      type: record.type,
      totalAmount: (Number(record.totalAmount) || 0).toString(),
      issueDate: record.issueDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      dueDate: record.dueDate ? record.dueDate.slice(0, 10) : "",
      notes: record.notes ?? "",
      currency: record.currency ?? currencyValues[0],
    });
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.number.trim() || !form.customerId || !form.totalAmount) {
      setError(translations.sales.form.number);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = mapFormToPayload(form);
      if (editingId) {
        await fetchJson(`/api/invoices/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson("/api/invoices", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      startCreate();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record: InvoiceRecord) {
    const confirmed = window.confirm(translations.common.confirmDelete);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await fetchJson(`/api/invoices/${record.id}`, { method: "DELETE" });
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
    ? translations.sales.form.submitUpdate
    : translations.sales.form.submitCreate;

  const formattedInvoices = useMemo(
    () =>
      invoices.map((invoice) => ({
        ...invoice,
        totalFormatted: formatCurrency(Number(invoice.totalAmount), invoice.currency),
      })),
    [invoices],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-white">{translations.sales.title}</h2>
          <p className="text-sm text-slate-300">{translations.sales.description}</p>
        </div>
        <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.number}
                </label>
                <input
                  name="number"
                  value={form.number}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.customer}
                </label>
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                >
                  <option value="" disabled>
                    --
                  </option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.project}
                </label>
                <select
                  name="projectId"
                  value={form.projectId}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                >
                  <option value="">--</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.status}
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                >
                  {invoiceStatusValues.map((status) => (
                    <option key={status} value={status}>
                      {translations.statuses.invoiceStatus[status] ?? status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.type}
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                >
                  {invoiceTypeValues.map((type) => (
                    <option key={type} value={type}>
                      {translations.statuses.invoices[type] ?? type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.totalAmount}
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  min="0"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.currency}
                </label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                >
                  {currencyValues.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.issueDate}
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.sales.form.dueDate}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {translations.sales.form.notes}
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleInputChange}
                rows={2}
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
              <th className="px-4 py-3">{translations.sales.table.number}</th>
              <th className="px-4 py-3">{translations.sales.table.customer}</th>
              <th className="px-4 py-3">{translations.sales.table.type}</th>
              <th className="px-4 py-3">{translations.sales.table.status}</th>
              <th className="px-4 py-3">{translations.sales.table.total}</th>
              <th className="px-4 py-3">{translations.sales.table.issued}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">
                  {translations.common.loading}
                </td>
              </tr>
            ) : formattedInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">
                  {translations.common.empty}
                </td>
              </tr>
            ) : (
              formattedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">
                    {invoice.number}
                  </td>
                  <td className="px-4 py-3">{invoice.customer?.name ?? "--"}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-widest text-slate-300">
                    {translations.statuses.invoices[invoice.type] ?? invoice.type}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] font-semibold text-slate-200">
                      {translations.statuses.invoiceStatus[invoice.status] ?? invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {invoice.totalFormatted}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {invoice.issueDate ? invoice.issueDate.slice(0, 10) : "--"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(invoice)}
                        className="rounded-md border border-white/20 px-3 py-1 text-white transition hover:border-sky-300/50"
                      >
                        {translations.common.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(invoice)}
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
        <p className="font-semibold text-slate-200">{translations.sales.pricingSystemTitle}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {translations.sales.pricingSystem.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function mapFormToPayload(form: InvoiceFormState) {
  return {
    number: form.number.trim(),
    customerId: form.customerId,
    projectId: form.projectId ? form.projectId : null,
    status: form.status,
    type: form.type,
    currency: form.currency,
    totalAmount: Number.parseFloat(form.totalAmount) || 0,
    issueDate: form.issueDate ? new Date(form.issueDate).toISOString() : undefined,
    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    notes: optionalString(form.notes),
    lineItems: [],
  };
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function formatCurrency(value: number, currency: string) {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}



