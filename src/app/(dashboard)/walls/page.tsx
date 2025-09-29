"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/modules/shared/http";
import { ParametricWindowSVG } from "@/modules/window-drawing/ParametricWindowSVG";
import type { FrameConfig } from "@/modules/window-drawing/types";

interface ProjectOption {
  id: string;
  name: string;
}

interface WindowFrameRecord {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  configuration?: Record<string, unknown> | null;
}

interface WindowInstanceRecord {
  id: string;
  wallId: string;
  windowFrameId?: string | null;
  label: string;
  positionXMm: number;
  positionYMm: number;
  sillHeightMm: number;
  widthMm: number;
  heightMm: number;
  rotationDeg: number;
  config?: Record<string, unknown> | null;
  windowFrame?: WindowFrameRecord | null;
}

interface WallRecord {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  widthMm: number;
  heightMm?: number | null;
  elevation?: string | null;
  windows: WindowInstanceRecord[];
}

type DraftWindow = Partial<Pick<WindowInstanceRecord, "positionXMm" | "positionYMm" | "widthMm" | "heightMm">>;

type ActiveGesture =
  | {
      type: "move";
      windowId: string;
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startXMm: number;
      startYMm: number;
    }
  | {
      type: "resize";
      windowId: string;
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startWidthMm: number;
      startHeightMm: number;
    };

const MIN_WINDOW_MM = 400;
const DEFAULT_FRAME_THICKNESS = 70;
const DEFAULT_MEMBER_THICKNESS = 60;
const DEFAULT_GLASS_INSET = 25;

export default function WallsPage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [walls, setWalls] = useState<WallRecord[]>([]);
  const [windowFrames, setWindowFrames] = useState<WindowFrameRecord[]>([]);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedWall = useMemo(
    () => walls.find((wall) => wall.id === selectedWallId) ?? null,
    [walls, selectedWallId],
  );

  const selectedWindow = useMemo(() => {
    if (!selectedWall) return null;
    return selectedWall.windows.find((instance) => instance.id === selectedWindowId) ?? null;
  }, [selectedWall, selectedWindowId]);

  useEffect(() => {
    async function bootstrap() {
      const projectData = await fetchJson<ProjectOption[]>("/api/projects");
      setProjects(projectData ?? []);
      if (projectData && projectData.length > 0) {
        setSelectedProjectId(projectData[0].id);
      }
    }
    bootstrap().catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    reloadProjectData(selectedProjectId).catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, [selectedProjectId]);

  async function reloadProjectData(projectId: string) {
    setError(null);
    const [wallData, frameData] = await Promise.all([
      fetchJson<WallRecord[]>(`/api/walls?projectId=${projectId}`),
      fetchJson<WindowFrameRecord[]>(`/api/window-frames?projectId=${projectId}`),
    ]);

    const nextWalls = wallData ?? [];
    setWalls(nextWalls);
    setWindowFrames(frameData ?? []);

    if (nextWalls.length === 0) {
      setSelectedWallId(null);
      setSelectedWindowId(null);
      return;
    }

    const preferredWallId =
      (selectedWallId && nextWalls.some((wall) => wall.id === selectedWallId))
        ? selectedWallId
        : nextWalls[0].id;

    setSelectedWallId(preferredWallId);

    const activeWall = nextWalls.find((wall) => wall.id === preferredWallId);
    if (activeWall) {
      const preferredWindowId =
        (selectedWindowId && activeWall.windows.some((instance) => instance.id === selectedWindowId))
          ? selectedWindowId
          : activeWall.windows[0]?.id ?? null;
      setSelectedWindowId(preferredWindowId);
    }
  }


function toFrameConfig(instance: WindowInstanceRecord): FrameConfig {
  const frameThickness = DEFAULT_FRAME_THICKNESS;
  const mullionThickness = DEFAULT_MEMBER_THICKNESS;
  const transomThickness = DEFAULT_MEMBER_THICKNESS;

  const interiorWidth = Math.max(instance.widthMm - frameThickness * 2, 100);
  const interiorHeight = Math.max(instance.heightMm - frameThickness * 2, 100);

  const configuration = (instance.windowFrame?.configuration ?? instance.config ?? {}) as Record<string, unknown>;
  const columns = normaliseSegments(interiorWidth, configuration.columns as number[] | undefined);
  const rows = normaliseSegments(interiorHeight, configuration.rows as number[] | undefined);

  return {
    widthMm: instance.widthMm,
    heightMm: instance.heightMm,
    frameThicknessMm: frameThickness,
    mullionThicknessMm: mullionThickness,
    transomThicknessMm: transomThickness,
    columns,
    rows,
    glassInsetMm: DEFAULT_GLASS_INSET,
    sashes: [],
  };
}

function normaliseSegments(total: number, segments: number[] | undefined) {
  if (!segments || segments.length === 0) {
    return [Math.max(total, 100)];
  }
  const sum = segments.reduce((acc, value) => acc + value, 0);
  if (sum <= 0) {
    return [Math.max(total, 100)];
  }
  return segments.map((segment) => Math.max(Math.round((segment / sum) * total), 20));
}

interface WallLayoutCanvasProps {
  wall: WallRecord;
  selectedWindowId: string | null;
  onWindowChange: (id: string, updates: Partial<WindowInstanceRecord>) => Promise<void>;
  onSelectWindow: (id: string) => void;
}

function WallLayoutCanvas({ wall, selectedWindowId, onWindowChange, onSelectWindow }: WallLayoutCanvasProps) {
  const [draftWindows, setDraftWindows] = useState<Record<string, DraftWindow>>({});
  const [activeGesture, setActiveGesture] = useState<ActiveGesture | null>(null);

  useEffect(() => {
    setDraftWindows({});
    setActiveGesture(null);
  }, [wall.id]);

  const canvasWidth = 720;
  const canvasHeight = 360;
  const wallWidth = wall.widthMm > 0 ? wall.widthMm : 1000;
  const wallHeight = wall.heightMm && wall.heightMm > 0 ? wall.heightMm : 2600;
  const scale = Math.min(canvasWidth / wallWidth, canvasHeight / wallHeight);

  const windows = wall.windows.map((instance) => ({
    ...instance,
    ...draftWindows[instance.id],
  }));

  function toPx(mm: number) {
    return mm * scale;
  }

  function handlePointerDown(event: ReactPointerEvent<SVGRectElement>, type: "move" | "resize", instance: WindowInstanceRecord) {
    const draft = draftWindows[instance.id] ?? {};
    const widthMm = draft.widthMm ?? instance.widthMm;
    const heightMm = draft.heightMm ?? instance.heightMm;
    const positionXMm = draft.positionXMm ?? instance.positionXMm;
    const positionYMm = draft.positionYMm ?? instance.positionYMm;

    const gesture: ActiveGesture =
      type === "move"
        ? {
            type: "move",
            windowId: instance.id,
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startXMm: positionXMm,
            startYMm: positionYMm,
          }
        : {
            type: "resize",
            windowId: instance.id,
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startWidthMm: widthMm,
            startHeightMm: heightMm,
          };

    setActiveGesture(gesture);
    (event.currentTarget.ownerSVGElement ?? event.currentTarget).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!activeGesture || event.pointerId !== activeGesture.pointerId) {
      return;
    }

    event.preventDefault();
    const deltaXmm = (event.clientX - activeGesture.startClientX) / scale;
    const deltaYmm = (event.clientY - activeGesture.startClientY) / scale;

    if (activeGesture.type === "move") {
      setDraftWindows((prev) => ({
        ...prev,
        [activeGesture.windowId]: {
          ...(prev[activeGesture.windowId] ?? {}),
          positionXMm: Math.max(0, Math.round(activeGesture.startXMm + deltaXmm)),
          positionYMm: Math.max(0, Math.round(activeGesture.startYMm + deltaYmm)),
        },
      }));
    } else {
      setDraftWindows((prev) => {
        const draft = prev[activeGesture.windowId] ?? {};
        return {
          ...prev,
          [activeGesture.windowId]: {
            ...draft,
            widthMm: Math.max(MIN_WINDOW_MM, Math.round(activeGesture.startWidthMm + deltaXmm)),
            heightMm: Math.max(MIN_WINDOW_MM, Math.round(activeGesture.startHeightMm + deltaYmm)),
          },
        };
      });
    }
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    if (!activeGesture || event.pointerId !== activeGesture.pointerId) {
      return;
    }

    (event.currentTarget as SVGElement).releasePointerCapture(event.pointerId);

    const draft = draftWindows[activeGesture.windowId];
    if (draft) {
      onWindowChange(activeGesture.windowId, draft).catch((err) => {
        console.error("Failed to update window", err);
      });
    }

    setDraftWindows((prev) => {
      const { [activeGesture.windowId]: _, ...rest } = prev;
      return rest;
    });
    setActiveGesture(null);
  }

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      className="w-full rounded-lg border border-white/10 bg-slate-950"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#020617" stroke="#1e293b" strokeDasharray="8 8" />
      <rect
        x={(canvasWidth - toPx(wallWidth)) / 2}
        y={(canvasHeight - toPx(wallHeight)) / 2}
        width={toPx(wallWidth)}
        height={toPx(wallHeight)}
        fill="#0f172a"
        stroke="#38bdf8"
        strokeWidth={2}
      />
      {windows.map((window) => {
        const left = (canvasWidth - toPx(wallWidth)) / 2 + toPx(window.positionXMm ?? 0);
        const top = (canvasHeight - toPx(wallHeight)) / 2 + toPx(window.positionYMm ?? 0);
        const widthPx = toPx(window.widthMm);
        const heightPx = toPx(window.heightMm);
        const isSelected = window.id === selectedWindowId;
        return (
          <g key={window.id}>
            <rect
              x={left}
              y={top}
              width={widthPx}
              height={heightPx}
              fill={isSelected ? "#38bdf8" : "#1e3a8a"}
              opacity={isSelected ? 0.4 : 0.25}
              stroke={isSelected ? "#38bdf8" : "#64748b"}
              strokeWidth={isSelected ? 3 : 2}
              className="cursor-move"
              onPointerDown={(event) => handlePointerDown(event, "move", window)}
              onClick={() => onSelectWindow(window.id)}
            />
            <circle
              cx={left + widthPx}
              cy={top + heightPx}
              r={10}
              fill="#38bdf8"
              stroke="#0f172a"
              strokeWidth={2}
              className="cursor-se-resize"
              onPointerDown={(event) => handlePointerDown(event, "resize", window)}
            />
            <text
              x={left + widthPx / 2}
              y={top - 6}
              textAnchor="middle"
              className="fill-slate-200 text-[11px]"
            >
              {window.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}