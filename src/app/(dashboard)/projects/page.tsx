"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/modules/i18n/LanguageProvider";
import { fetchJson } from "@/modules/shared/http";
import { projectStatusValues } from "@/modules/shared/constants";

interface CustomerOption {
  id: string;
  name: string;
}

interface ProjectRecord {
  id: string;
  name: string;
  reference?: string | null;
  status: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
  } | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
  windowFrames?: Array<{ id: string }>;
  address?: string | null;
}

interface ProjectFormState {
  name: string;
  reference: string;
  customerId: string;
  status: string;
  startDate: string;
  endDate: string;
  address: string;
  description: string;
}

const emptyForm: ProjectFormState = {
  name: "",
  reference: "",
  customerId: "",
  status: projectStatusValues[0],
  startDate: "",
  endDate: "",
  address: "",
  description: "",
};

export default function ProjectsPage() {
  const translations = useTranslations();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
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
      const [projectData, customerData] = await Promise.all([
        fetchJson<ProjectRecord[]>("/api/projects"),
        fetchJson<CustomerOption[]>("/api/customers"),
      ]);
      setProjects(projectData ?? []);
      setCustomers((customerData ?? []).map((cust) => ({ id: cust.id, name: cust.name })));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(project: ProjectRecord) {
    setEditingId(project.id);
    setForm({
      name: project.name ?? "",
      reference: project.reference ?? "",
      customerId: project.customerId,
      status: project.status,
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      endDate: project.endDate ? project.endDate.slice(0, 10) : "",
      description: project.description ?? "",
    });
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.customerId) {
      setError(translations.projects.form.name);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = mapFormToPayload(form);
      if (editingId) {
        await fetchJson(`/api/projects/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson("/api/projects", {
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

  async function handleDelete(project: ProjectRecord) {
    const confirmed = window.confirm(translations.common.confirmDelete);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await fetchJson(`/api/projects/${project.id}`, { method: "DELETE" });
      if (editingId === project.id) {
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
    ? translations.projects.form.submitUpdate
    : translations.projects.form.submitCreate;

  const statusOptions = projectStatusValues.map((status) => ({
    value: status,
    label: translations.statuses.projects[status] ?? status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-white">{translations.projects.title}</h2>
          <p className="text-sm text-slate-300">{translations.projects.description}</p>
          <Link
            href="/projects/window-frames"
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-sky-500/40 transition hover:bg-sky-300"
          >
            {translations.projects.windowFramesLink ?? "Window Frames in Progress"}
          </Link>
        </div>
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900/60 p-4">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {translations.projects.form.name}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.projects.form.reference}
                </label>
                <input
                  name="reference"
                  value={form.reference}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.projects.form.customer}
                </label>
                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
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
                  {translations.projects.form.status}
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.projects.form.description}
                </label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.projects.form.startDate}
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.projects.form.endDate}
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
            {error ? <p className="text-xs text-rose-300">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
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

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-300">
            {translations.common.loading}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-300">
            {translations.common.empty}
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="rounded-lg border border-white/10 bg-slate-900/50 p-5">
              <div className="flex items-start justify-between">
                <div>
                  {project.reference ? (
                    <p className="text-xs text-slate-400">{project.reference}</p>
                  ) : null}
                  <h3 className="text-lg font-semibold text-white">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {project.customer?.name ?? "--"}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                  {translations.statuses.projects[project.status] ?? project.status}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div>
                  <dt className="text-slate-400">{translations.projects.fields.start}</dt>
                  <dd>{project.startDate ? project.startDate.slice(0, 10) : translations.projects.datePlaceholder}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">{translations.projects.fields.end}</dt>
                  <dd>{project.endDate ? project.endDate.slice(0, 10) : translations.projects.datePlaceholder}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">{translations.projects.fields.frames}</dt>
                  <dd>{project.windowFrames?.length ?? 0}</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => startEdit(project)}
                  className="rounded-md border border-white/20 px-3 py-1 text-white transition hover:border-emerald-300/60"
                >
                  {translations.common.edit}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project)}
                  className="rounded-md border border-rose-400/40 px-3 py-1 text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                >
                  {translations.common.delete}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-lg border border-dashed border-white/20 bg-slate-900/30 p-4 text-xs text-slate-300">
        <p className="font-semibold text-slate-200">{translations.projects.roadmapTitle}</p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          {translations.projects.roadmap.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function mapFormToPayload(form: ProjectFormState) {
  return {
    name: form.name.trim(),
    reference: optionalString(form.reference),
    customerId: form.customerId,
    status: form.status,
    startDate: parseDate(form.startDate),
    endDate: parseDate(form.endDate),
    description: optionalString(form.description),
  };
}

function parseDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return new Date(trimmed).toISOString();
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}


