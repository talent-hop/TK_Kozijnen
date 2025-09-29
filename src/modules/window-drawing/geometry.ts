// src/modules/window-drawing/geometry.ts
// Helper utilities for converting real-world measurements into SVG coordinates.

import type { DrawingScalingOptions, FrameConfig } from "./types";

export function mmToPx(valueMm: number, pxPerMm: number): number {
  return valueMm * pxPerMm;
}

export function computeScaling(
  config: FrameConfig,
  options: DrawingScalingOptions,
): {
  pxPerMm: number;
  paddingPx: number;
  originPx: { x: number; y: number };
  canvas: { width: number; height: number };
} {
  const paddingPx = options.paddingPx ?? 32;
  const drawableWidth = Math.max(options.canvasWidthPx - paddingPx * 2, 1);
  const drawableHeight = Math.max(options.canvasHeightPx - paddingPx * 2, 1);

  const scaleX = drawableWidth / config.widthMm;
  const scaleY = drawableHeight / config.heightMm;
  const pxPerMm = Math.min(scaleX, scaleY);

  const drawnWidthPx = config.widthMm * pxPerMm;
  const drawnHeightPx = config.heightMm * pxPerMm;

  const extraX = (options.canvasWidthPx - drawnWidthPx) / 2;
  const extraY = (options.canvasHeightPx - drawnHeightPx) / 2;

  return {
    pxPerMm,
    paddingPx,
    originPx: {
      x: Math.max(paddingPx, extraX),
      y: Math.max(paddingPx, extraY),
    },
    canvas: {
      width: options.canvasWidthPx,
      height: options.canvasHeightPx,
    },
  };
}

export function getInteriorDimensions(config: FrameConfig) {
  const interiorWidth =
    config.widthMm - config.frameThicknessMm * 2 -
    config.mullionThicknessMm * (config.columns.length - 1);
  const interiorHeight =
    config.heightMm - config.frameThicknessMm * 2 -
    config.transomThicknessMm * (config.rows.length - 1);

  return { interiorWidth, interiorHeight };
}

export function columnOffsetMm(config: FrameConfig, columnIndex: number) {
  const { frameThicknessMm, mullionThicknessMm, columns } = config;
  let offset = frameThicknessMm;
  for (let idx = 0; idx < columnIndex; idx += 1) {
    offset += columns[idx] + mullionThicknessMm;
  }
  return offset;
}

export function rowOffsetMm(config: FrameConfig, rowIndex: number) {
  const { frameThicknessMm, transomThicknessMm, rows } = config;
  let offset = frameThicknessMm;
  for (let idx = 0; idx < rowIndex; idx += 1) {
    offset += rows[idx] + transomThicknessMm;
  }
  return offset;
}

export function accumulate(values: number[]): number[] {
  const result: number[] = [0];
  let total = 0;
  for (const value of values) {
    total += value;
    result.push(total);
  }
  return result;
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function validateFrameConfig(config: FrameConfig) {
  if (config.columns.length === 0 || config.rows.length === 0) {
    throw new Error("Frame configuration requires at least one column and one row.");
  }

  if (config.frameThicknessMm <= 0) {
    throw new Error("Frame thickness must be positive.");
  }

  if (config.widthMm <= 0 || config.heightMm <= 0) {
    throw new Error("Frame dimensions must be positive.");
  }

  const { interiorWidth, interiorHeight } = getInteriorDimensions(config);
  const sumColumns = sum(config.columns);
  const sumRows = sum(config.rows);

  if (Math.abs(sumColumns - interiorWidth) > 0.01) {
    throw new Error(
      `Column widths (${sumColumns}mm) do not match interior width (${interiorWidth}mm).`,
    );
  }

  if (Math.abs(sumRows - interiorHeight) > 0.01) {
    throw new Error(`Row heights (${sumRows}mm) do not match interior height (${interiorHeight}mm).`);
  }
}