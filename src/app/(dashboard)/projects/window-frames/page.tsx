"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "@/modules/i18n/LanguageProvider";
import { ParametricWindowSVG } from "@/modules/window-drawing/ParametricWindowSVG";
import type { FrameConfig } from "@/modules/window-drawing/types";
import { validateFrameConfig } from "@/modules/window-drawing/geometry";
import { fetchJson } from "@/modules/shared/http";

const DEFAULT_FRAME_THICKNESS = 70;
const DEFAULT_GLASS_INSET = 25;
const DEFAULT_MULLION_THICKNESS = 60;
const DEFAULT_TRANSOM_THICKNESS = 60;

interface ProjectOption {
  id: string;
  name: string;
}

interface WindowFrameRecord {
  id: string;
  projectId: string;
  label: string;
  status: string;
  widthMm: number;
  heightMm: number;
  notes?: string | null;
  configuration?: Record<string, unknown> | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface WindowFrameFormState {
  projectId: string;
  label: string;
  status: string;
  widthMm: string;
  heightMm: string;
  notes: string;
}

export default function ProjectWindowFramesPage() {
  const translations = useTranslations();
  const statusOptions = useMemo(
    () => Object.keys(translations.statuses.windowFrames),
    [translations.statuses.windowFrames],
  );

  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [frames, setFrames] = useState<WindowFrameRecord[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [form, setForm] = useState<WindowFrameFormState>(() => ({
    projectId: "",
    label: "",
    status: statusOptions[0] ?? "Awaiting glass",
    widthMm: "1200",
    heightMm: "1400",
    notes: "",
  }));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchSequence = useRef(0);

  const hasProjects = projects.length > 0;

  const frameConfig = useMemo<FrameConfig>(() => {
    const parsedWidth = Number.parseInt(form.widthMm, 10);
    const parsedHeight = Number.parseInt(form.heightMm, 10);
    const widthMm = Number.isFinite(parsedWidth) && parsedWidth > 0 ? Math.max(parsedWidth, 400) : 1200;
    const heightMm = Number.isFinite(parsedHeight) && parsedHeight > 0 ? Math.max(parsedHeight, 400) : 1400;
    const frameThickness = DEFAULT_FRAME_THICKNESS;
    const interiorWidth = widthMm - frameThickness * 2;
    const interiorHeight = heightMm - frameThickness * 2;
    const glassInset = Math.max(10, Math.min(DEFAULT_GLASS_INSET, Math.floor(Math.min(interiorWidth, interiorHeight) / 10)));
    return {
      widthMm,
      heightMm,
      frameThicknessMm: frameThickness,
      mullionThicknessMm: 0,
      transomThicknessMm: 0,
      columns: [interiorWidth],
      rows: [interiorHeight],
      glassInsetMm: glassInset,
      sashes: [],
    };
  }, [form.heightMm, form.widthMm]);

  const selectedFrame = useMemo(
    () => frames.find((frame) => frame.id === selectedFrameId) ?? null,
    [frames, selectedFrameId],
  );

  const previewConfig = useMemo<FrameConfig>(() => {
    if (editingId) {
      return frameConfig;
    }
    if (selectedFrame) {
      return buildDrawingConfig(selectedFrame);
    }
    return frameConfig;
  }, [editingId, frameConfig, selectedFrame]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError(null);
        const projectData = await fetchJson<ProjectOption[]>("/api/projects");
        if (cancelled) {
          return;
        }
        const projectOptions = (projectData ?? []).map((project) => ({ id: project.id, name: project.name }));
        setProjects(projectOptions);

        const initialProjectId = projectOptions[0]?.id ?? null;
        setSelectedProjectId(initialProjectId);

        if (!initialProjectId) {
          setFrames([]);
          setSelectedFrameId(null);
          setLoading(false);
          return;
        }

        setSelectedFrameId(null);
        await loadFrames(initialProjectId);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setError(err instanceof Error ? err.message : String(err));
        setProjects([]);
        setFrames([]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (editingId) {
      return;
    }
    if (selectedProjectId) {
      setForm((prev) => {
        if (prev.projectId === selectedProjectId) {
          return prev;
        }
        return { ...prev, projectId: selectedProjectId };
      });
    }
  }, [editingId, selectedProjectId]);


  async function loadFrames(projectId: string) {
    const requestId = ++fetchSequence.current;
    setLoading(true);
    try {
      const data = await fetchJson<WindowFrameRecord[]>(
        `/api/window-frames?projectId=${encodeURIComponent(projectId)}`,
      );
      if (requestId !== fetchSequence.current) {
        return;
      }
      const nextFrames = (data ?? []).filter((frame) => frame.projectId === projectId);
      setFrames(nextFrames);
      setSelectedFrameId((previousSelected) => {
        if (nextFrames.length === 0) {
          return null;
        }
        if (previousSelected && nextFrames.some((item) => item.id === previousSelected)) {
          return previousSelected;
        }
        return nextFrames[0].id;
      });
      setError(null);
    } catch (err) {
      if (requestId !== fetchSequence.current) {
        return;
      }
      setError(err instanceof Error ? err.message : String(err));
      setFrames([]);
      setSelectedFrameId(null);
    } finally {
      if (requestId === fetchSequence.current) {
        setLoading(false);
      }
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm({
      projectId: selectedProjectId ?? projects[0]?.id ?? "",
      label: "",
      status: statusOptions[0] ?? "Awaiting glass",
      widthMm: "1200",
      heightMm: "1400",
      notes: "",
    });
  }

  function startEdit(record: WindowFrameRecord) {
    setEditingId(record.id);
    setSelectedFrameId(record.id);
    if (record.projectId !== selectedProjectId) {
      setSelectedProjectId(record.projectId);
    }
    setForm({
      projectId: record.projectId,
      label: record.label ?? "",
      status: record.status ?? statusOptions[0] ?? "Awaiting glass",
      widthMm: String(record.widthMm ?? 0),
      heightMm: String(record.heightMm ?? 0),
      notes: record.notes ?? "",
    });
  }

  function handleFrameClick(record: WindowFrameRecord) {
    setSelectedFrameId(record.id);
  }

  function handleProjectFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextProjectId = event.target.value || null;
    if (editingId) {
      setEditingId(null);
    }
    setSelectedProjectId(nextProjectId);
    if (!nextProjectId) {
      setFrames([]);
      setSelectedFrameId(null);
      return;
    }
    setSelectedFrameId(null);
    setForm((prev) => ({ ...prev, projectId: nextProjectId }));
    void loadFrames(nextProjectId);
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const width = Number.parseInt(form.widthMm, 10);
    const height = Number.parseInt(form.heightMm, 10);
    if (
      !form.projectId ||
      !form.label.trim() ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      setError(translations.drawings.form.label);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = mapFormToPayload(form);
      if (editingId) {
        await fetchJson(`/api/window-frames/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson("/api/window-frames", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setSelectedProjectId(payload.projectId);
      await loadFrames(payload.projectId);
      startCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record: WindowFrameRecord) {
    const confirmed = window.confirm(translations.common.confirmDelete);
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      await fetchJson(`/api/window-frames/${record.id}`, { method: "DELETE" });
      if (editingId === record.id) {
        startCreate();
      }
      const projectIdToReload = selectedProjectId ?? record.projectId;
      if (projectIdToReload) {
        await loadFrames(projectIdToReload);
      } else {
        setFrames([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{translations.drawings.title}</h2>
          <p className="text-sm text-slate-300">{translations.drawings.description}</p>
        </div>
        {hasProjects ? (
          <div className="min-w-[220px] max-w-xs">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {translations.drawings.form.project}
            </label>
            <select
              value={selectedProjectId ?? ""}
              onChange={handleProjectFilterChange}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p>
      ) : null}

      {!hasProjects ? (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          {translations.drawings.noProjectWarning ?? "Add a project before creating window frames."}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6 rounded-xl border border-white/10 bg-slate-900/70 p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {translations.drawings.form.project}
              </label>
              <select
                name="projectId"
                required
                value={form.projectId}
                onChange={handleInputChange}
                disabled={!hasProjects}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="" disabled>
                  --
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.drawings.form.label}
                </label>
                <input
                  required
                  name="label"
                  value={form.label}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.drawings.form.status}
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {translations.statuses.windowFrames[status] ?? status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.drawings.form.width}
                </label>
                <input
                  type="number"
                  name="widthMm"
                  min={100}
                  value={form.widthMm}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {translations.drawings.form.height}
                </label>
                <input
                  type="number"
                  name="heightMm"
                  min={100}
                  value={form.heightMm}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {translations.drawings.form.notes}
              </label>
              <textarea
                name="notes"
                rows={2}
                value={form.notes}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving || !hasProjects}
                className="rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? translations.common.saving
                  : editingId
                  ? translations.drawings.form.submitUpdate
                  : translations.drawings.form.submitCreate}
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

        <div className="space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            {translations.inventory.framesTitle}
          </h3>
          {loading ? (
            <p className="text-sm text-slate-300">{translations.common.loading}</p>
          ) : frames.length === 0 ? (
            <p className="text-sm text-slate-300">{translations.common.empty}</p>
          ) : (
            <div className="space-y-3">
              {frames.map((frame) => {
                const drawingConfig = buildDrawingConfig(frame);
                const isSelected = frame.id === selectedFrameId;
                const cardClass = `space-y-4 rounded-md border p-4 transition hover:border-sky-300/60 focus:outline-none focus:ring-2 focus:ring-sky-400/60 cursor-pointer ${isSelected ? "border-sky-400/60 bg-slate-900/70" : "border-white/10 bg-slate-900/50"}`;
                return (
                  <div
                    key={frame.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleFrameClick(frame)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " " || event.key === "Space") {
                        event.preventDefault();
                        handleFrameClick(frame);
                      }
                    }}
                    className={cardClass}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-400">{frame.project?.name ?? frame.projectId}</p>
                        <p className="text-base font-semibold text-white">{frame.label}</p>
                        <p className="text-xs text-slate-400">
                          {frame.widthMm} x {frame.heightMm} mm
                        </p>
                        {frame.notes ? <p className="mt-1 text-xs text-slate-400">{frame.notes}</p> : null}
                      </div>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-200">
                        {translations.statuses.windowFrames[frame.status] ?? frame.status}
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-md border border-white/5 bg-slate-950/40 p-3">
                      <div className="inline-flex min-w-[480px] justify-center">
                        <ParametricWindowSVG
                          config={drawingConfig}
                          width={520}
                          height={280}
                          paddingPx={32}
                          showDimensions
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          startEdit(frame);
                        }}
                        className="rounded-md border border-white/20 px-3 py-1 text-white transition hover:border-sky-300/50"
                      >
                        {translations.common.edit}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(frame);
                        }}
                        className="rounded-md border border-rose-400/40 px-3 py-1 text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                      >
                        {translations.common.delete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
          {translations.drawings.previewTitle ?? "Window Frame Preview"}
        </h3>
        <div className="mt-4 overflow-x-auto">
          <div className="inline-flex min-w-[720px] justify-center">
            <ParametricWindowSVG config={previewConfig} width={720} height={360} paddingPx={48} showDimensions />
          </div>
        </div>
      </div>
    </div>
  );
}

function buildDrawingConfig(frame: WindowFrameRecord): FrameConfig {
  const fallback = createFallbackFrameConfig(frame);
  const rawConfiguration = frame.configuration;
  if (!rawConfiguration || typeof rawConfiguration !== "object") {
    return fallback;
  }

  try {
    const candidate = normalizeFrameConfig(frame, rawConfiguration as Record<string, unknown>);
    validateFrameConfig(candidate);
    return candidate;
  } catch {
    return fallback;
  }
}

function normalizeFrameConfig(
  frame: WindowFrameRecord,
  rawConfiguration: Record<string, unknown>,
): FrameConfig {
  let frameThickness = positiveNumber(rawConfiguration.frameThicknessMm) ?? DEFAULT_FRAME_THICKNESS;
  const maxFrameThickness = Math.max(20, Math.floor(Math.min(frame.widthMm, frame.heightMm) / 3));
  frameThickness = clampNumber(frameThickness, 20, maxFrameThickness);

  let columnSegments = extractSegments(rawConfiguration.columns);
  const divisions = positiveInteger(rawConfiguration.divisions);
  if (!columnSegments && divisions && divisions > 0) {
    columnSegments = Array.from({ length: divisions }, () => 1);
  }

  let columnCount = columnSegments?.length ?? 1;
  if (columnCount < 1) {
    columnCount = 1;
  }

  let mullionThickness =
    columnCount > 1
      ? clampNumber(
          nonNegativeNumber(rawConfiguration.mullionThicknessMm) ?? DEFAULT_MULLION_THICKNESS,
          0,
          Math.max(0, Math.floor((frame.widthMm - frameThickness * 2) / columnCount) - 20),
        )
      : 0;

  let interiorWidth = frame.widthMm - frameThickness * 2 - mullionThickness * (columnCount - 1);
  if (interiorWidth <= 0) {
    columnCount = 1;
    mullionThickness = 0;
    interiorWidth = Math.max(frame.widthMm - frameThickness * 2, 1);
  }

  const columns = normalizeSegments(columnSegments, interiorWidth, columnCount);

  const rowSegments = extractSegments(rawConfiguration.rows);
  let rowCount = rowSegments?.length ?? 1;
  if (rowCount < 1) {
    rowCount = 1;
  }

  let transomThickness =
    rowCount > 1
      ? clampNumber(
          nonNegativeNumber(rawConfiguration.transomThicknessMm) ?? DEFAULT_TRANSOM_THICKNESS,
          0,
          Math.max(0, Math.floor((frame.heightMm - frameThickness * 2) / rowCount) - 20),
        )
      : 0;

  let interiorHeight = frame.heightMm - frameThickness * 2 - transomThickness * (rowCount - 1);
  if (interiorHeight <= 0) {
    rowCount = 1;
    transomThickness = 0;
    interiorHeight = Math.max(frame.heightMm - frameThickness * 2, 1);
  }

  const rows = normalizeSegments(rowSegments, interiorHeight, rowCount);

  const smallestModule = Math.min(...columns, ...rows);
  const rawGlassInset = positiveNumber(rawConfiguration.glassInsetMm) ?? DEFAULT_GLASS_INSET;
  const maxInset = Math.max(5, Math.floor(smallestModule / 4));
  const glassInset = clampNumber(rawGlassInset, 5, maxInset);

  return {
    widthMm: frame.widthMm,
    heightMm: frame.heightMm,
    frameThicknessMm: frameThickness,
    mullionThicknessMm: mullionThickness,
    transomThicknessMm: transomThickness,
    columns,
    rows,
    glassInsetMm: glassInset,
    sashes: [],
  };
}

function createFallbackFrameConfig(frame: WindowFrameRecord): FrameConfig {
  const frameThickness = DEFAULT_FRAME_THICKNESS;
  const interiorWidth = Math.max(frame.widthMm - frameThickness * 2, 1);
  const interiorHeight = Math.max(frame.heightMm - frameThickness * 2, 1);
  const glassInset = Math.max(10, Math.min(DEFAULT_GLASS_INSET, Math.floor(Math.min(interiorWidth, interiorHeight) / 10)));

  return {
    widthMm: frame.widthMm,
    heightMm: frame.heightMm,
    frameThicknessMm: frameThickness,
    mullionThicknessMm: 0,
    transomThicknessMm: 0,
    columns: [interiorWidth],
    rows: [interiorHeight],
    glassInsetMm: glassInset,
    sashes: [],
  };
}

function normalizeSegments(
  segments: number[] | null,
  target: number,
  desiredLength: number,
): number[] {
  if (target <= 0) {
    return Array.from({ length: Math.max(desiredLength, 1) }, () => 1);
  }

  const baseSegments = segments && segments.length > 0 ? segments : Array.from({ length: desiredLength }, () => 1);
  const sanitized = baseSegments.map((value) => Math.max(1, value));
  const total = sanitized.reduce((sum, item) => sum + item, 0);
  if (total <= 0) {
    return Array.from({ length: Math.max(desiredLength, 1) }, () => target / Math.max(desiredLength, 1));
  }

  const scale = target / total;
  const scaled = sanitized.map((value) => Math.max(1, value * scale));
  const adjustedTotal = scaled.reduce((sum, item) => sum + item, 0);
  const diff = target - adjustedTotal;
  scaled[scaled.length - 1] = Math.max(1, scaled[scaled.length - 1] + diff);
  return scaled;
}

function extractSegments(input: unknown): number[] | null {
  if (!Array.isArray(input)) {
    return null;
  }
  const segments = input
    .map((value) => positiveNumber(value))
    .filter((value): value is number => value !== undefined && value > 0);
  return segments.length > 0 ? segments : null;
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function positiveNumber(value: unknown): number | undefined {
  const parsed = parseNumber(value);
  return parsed !== undefined && parsed > 0 ? parsed : undefined;
}

function nonNegativeNumber(value: unknown): number | undefined {
  const parsed = parseNumber(value);
  return parsed !== undefined && parsed >= 0 ? parsed : undefined;
}

function positiveInteger(value: unknown): number | undefined {
  const parsed = positiveNumber(value);
  return parsed !== undefined ? Math.max(1, Math.floor(parsed)) : undefined;
}

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

function mapFormToPayload(form: WindowFrameFormState) {
  return {
    projectId: form.projectId,
    label: form.label.trim(),
    status: form.status,
    widthMm: Number.parseInt(form.widthMm, 10),
    heightMm: Number.parseInt(form.heightMm, 10),
    notes: optionalString(form.notes),
  };
}

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}


