// src/modules/window-drawing/types.ts
// Shared type definitions for the parametric window drawing module.

export enum OpeningDirection {
  Fixed = "FIXED",
  LeftHinged = "LEFT_HINGED",
  RightHinged = "RIGHT_HINGED",
  TiltTurnLeft = "TILT_TURN_LEFT",
  TiltTurnRight = "TILT_TURN_RIGHT",
}

export interface SashSpec {
  /** Zero-based column index for the sash. */
  column: number;
  /** Zero-based row index for the sash. */
  row: number;
  /** Opening direction; Fixed panes omit directional glyphs. */
  opening: OpeningDirection;
  /** Optional override for glyph label. */
  label?: string;
}

export interface FrameConfig {
  /** Overall outside width in millimetres. */
  widthMm: number;
  /** Overall outside height in millimetres. */
  heightMm: number;
  /** Profile thickness applied on all sides. */
  frameThicknessMm: number;
  /** Thickness (mm) for vertical members between columns. */
  mullionThicknessMm: number;
  /** Thickness (mm) for horizontal members between rows. */
  transomThicknessMm: number;
  /** Clear opening widths per column (excluding mullion/profile thickness). */
  columns: number[];
  /** Clear opening heights per row (excluding transom/profile thickness). */
  rows: number[];
  /** Glass inset from the structural members (mm). */
  glassInsetMm: number;
  /** Optional sash configuration mapped to the glass grid. */
  sashes?: SashSpec[];
}

export interface DrawingScalingOptions {
  /** Canvas width in pixels available for the drawing. */
  canvasWidthPx: number;
  /** Canvas height in pixels available for the drawing. */
  canvasHeightPx: number;
  /** Padding around the drawing in pixels. */
  paddingPx?: number;
}

export interface WindowDrawingStyle {
  frameFill?: string;
  mullionFill?: string;
  glassFill?: string;
  glassStroke?: string;
  dimensionColor?: string;
  dimensionFontSize?: number;
  background?: string;
}

export interface ExportResult {
  pngDataUrl: string;
  blob: Blob;
}