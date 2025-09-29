"use client";

import { useMemo, useRef, useState } from "react";
import { ParametricWindowSVG, ParametricWindowHandle } from "./ParametricWindowSVG";
import { OpeningDirection } from "./types";
import type { FrameConfig } from "./types";

const openingOptions = [
  { value: OpeningDirection.Fixed, label: "Fixed" },
  { value: OpeningDirection.LeftHinged, label: "Left hinged" },
  { value: OpeningDirection.RightHinged, label: "Right hinged" },
  { value: OpeningDirection.TiltTurnLeft, label: "Tilt-turn left" },
  { value: OpeningDirection.TiltTurnRight, label: "Tilt-turn right" },
];

const BASE_CONFIG: Omit<FrameConfig, "sashes"> = {
  widthMm: 2460,
  heightMm: 2000,
  frameThicknessMm: 70,
  mullionThicknessMm: 60,
  transomThicknessMm: 60,
  columns: [800, 600, 800],
  rows: [1200, 600],
  glassInsetMm: 25,
};

const DEFAULT_SASHES = [
  { column: 0, row: 0, opening: OpeningDirection.LeftHinged as OpeningDirection },
  { column: 1, row: 0, opening: OpeningDirection.Fixed as OpeningDirection },
  { column: 2, row: 0, opening: OpeningDirection.RightHinged as OpeningDirection },
  { column: 1, row: 1, opening: OpeningDirection.TiltTurnRight as OpeningDirection },
];

export function ParametricWindowExample() {
  const [glassInset, setGlassInset] = useState(BASE_CONFIG.glassInsetMm);
  const [sashes, setSashes] = useState(DEFAULT_SASHES);
  const svgRef = useRef<ParametricWindowHandle | null>(null);

  const config = useMemo<FrameConfig>(
    () => ({
      ...BASE_CONFIG,
      glassInsetMm: glassInset,
      sashes,
    }),
    [glassInset, sashes],
  );

  const sashMatrix = useMemo(() => {
    const matrix: OpeningDirection[][] = [];
    BASE_CONFIG.rows.forEach((_, rowIdx) => {
      matrix[rowIdx] = [];
      BASE_CONFIG.columns.forEach((_, columnIdx) => {
        const match = sashes.find((item) => item.column === columnIdx && item.row === rowIdx);
        matrix[rowIdx][columnIdx] = match?.opening ?? OpeningDirection.Fixed;
      });
    });
    return matrix;
  }, [sashes]);

  function handleSashChange(row: number, column: number, opening: OpeningDirection) {
    setSashes((prev) => {
      const next = prev.filter((item) => !(item.row === row && item.column === column));
      if (opening !== OpeningDirection.Fixed) {
        next.push({ row, column, opening });
      }
      return next;
    });
  }

  async function handleExport() {
    if (!svgRef.current) {
      return;
    }
    await svgRef.current.exportAsPng({ fileName: "window-parametric.png" });
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-white/10 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Parametric Window Drawing</h2>
          <p className="text-sm text-slate-300">
            Adjust sash openings and glass inset to generate a technical-style elevation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md shadow-sky-500/40 transition hover:bg-sky-300"
        >
          Export PNG
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex items-center justify-center rounded-lg border border-white/10 bg-slate-950/50 p-4">
          <ParametricWindowSVG
            ref={svgRef}
            config={config}
            width={720}
            height={480}
            paddingPx={48}
            showDimensions
            styleOverrides={{ background: "#020617" }}
          />
        </div>

        <div className="space-y-6 rounded-lg border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
          <div>
            <label className="block text-xs uppercase tracking-[0.35em] text-slate-400">Glass inset</label>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={glassInset}
              onChange={(event) => setGlassInset(Number(event.target.value))}
              className="mt-2 w-full"
            />
            <p className="mt-1 text-xs text-slate-300">{glassInset.toFixed(0)} mm</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.35em] text-slate-400">Opening direction</h3>
            <div className="grid gap-3">
              {sashMatrix.map((row, rowIdx) => (
                <div key={`row-${rowIdx}`} className="grid grid-cols-3 gap-3">
                  {row.map((value, columnIdx) => (
                    <label key={`sash-${rowIdx}-${columnIdx}`} className="flex flex-col gap-1 text-xs">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                        Row {rowIdx + 1}, Col {columnIdx + 1}
                      </span>
                      <select
                        value={value}
                        onChange={(event) =>
                          handleSashChange(rowIdx, columnIdx, event.target.value as OpeningDirection)
                        }
                        className="rounded-md border border-white/10 bg-slate-900/80 px-2 py-1 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                      >
                        {openingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}