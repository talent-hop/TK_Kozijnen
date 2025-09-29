// src/modules/window-drawing/ParametricWindowSVG.tsx
// Main parametric SVG renderer for kozijnen drawings.

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  columnOffsetMm,
  computeScaling,
  mmToPx,
  rowOffsetMm,
  sum,
  validateFrameConfig,
} from "./geometry";
import { DimensionLines } from "./DimensionLines";
import { OpeningDirection } from "./types";
import type { FrameConfig, WindowDrawingStyle } from "./types";

export interface ParametricWindowSVGProps {
  config: FrameConfig;
  /** SVG viewport width in pixels. */
  width?: number;
  /** SVG viewport height in pixels. */
  height?: number;
  /** Padding in pixels around the drawing. */
  paddingPx?: number;
  /** Optional override styles for fills, strokes and fonts. */
  styleOverrides?: WindowDrawingStyle;
  /** Toggle dimension line rendering. */
  showDimensions?: boolean;
  className?: string;
}

export interface ParametricWindowHandle {
  exportAsPng(options?: { fileName?: string; scale?: number; backgroundColor?: string }): Promise<void>;
}

const DEFAULT_WIDTH = 720;
const DEFAULT_HEIGHT = 480;

const DEFAULT_STYLE: Required<WindowDrawingStyle> = {
  frameFill: "#1f2937",
  mullionFill: "#334155",
  glassFill: "#38bdf8",
  glassStroke: "#0f172a",
  dimensionColor: "#f8fafc",
  dimensionFontSize: 12,
  background: "#0b1120",
};

export const ParametricWindowSVG = forwardRef<ParametricWindowHandle, ParametricWindowSVGProps>(
  (
    {
      config,
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
      paddingPx = 36,
      styleOverrides,
      showDimensions = true,
      className,
    },
    ref,
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    const style = useMemo(() => ({ ...DEFAULT_STYLE, ...styleOverrides }), [styleOverrides]);

    const scaling = useMemo(() => {
      validateFrameConfig(config);
      return computeScaling(config, {
        canvasWidthPx: width,
        canvasHeightPx: height,
        paddingPx,
      });
    }, [config, height, paddingPx, width]);

    const frameThicknessPx = mmToPx(config.frameThicknessMm, scaling.pxPerMm);
    const mullionThicknessPx = mmToPx(config.mullionThicknessMm, scaling.pxPerMm);
    const transomThicknessPx = mmToPx(config.transomThicknessMm, scaling.pxPerMm);
    const glassInsetPx = mmToPx(config.glassInsetMm, scaling.pxPerMm);

    const interiorWidthMm = useMemo(() => sum(config.columns), [config.columns]);
    const interiorHeightMm = useMemo(() => sum(config.rows), [config.rows]);

    const interiorWidthPx = mmToPx(interiorWidthMm, scaling.pxPerMm);
    const interiorHeightPx = mmToPx(interiorHeightMm, scaling.pxPerMm);

    const innerOrigin = {
      x: scaling.originPx.x + frameThicknessPx,
      y: scaling.originPx.y + frameThicknessPx,
    };

    const sashMap = useMemo(() => {
      const map = new Map<string, OpeningDirection>();
      for (const sash of config.sashes ?? []) {
        map.set(`${sash.column}-${sash.row}`, sash.opening);
      }
      return map;
    }, [config.sashes]);

    const outerSegmentsHorizontal = useMemo(() => {
      const segments: number[] = [config.frameThicknessMm];
      config.columns.forEach((widthMm, idx) => {
        segments.push(widthMm);
        if (idx < config.columns.length - 1) {
          segments.push(config.mullionThicknessMm);
        }
      });
      segments.push(config.frameThicknessMm);
      return segments;
    }, [config.columns, config.frameThicknessMm, config.mullionThicknessMm]);

    const outerSegmentsVertical = useMemo(() => {
      const segments: number[] = [config.frameThicknessMm];
      config.rows.forEach((heightMm, idx) => {
        segments.push(heightMm);
        if (idx < config.rows.length - 1) {
          segments.push(config.transomThicknessMm);
        }
      });
      segments.push(config.frameThicknessMm);
      return segments;
    }, [config.frameThicknessMm, config.rows, config.transomThicknessMm]);

    const exportAsPng = useCallback<ParametricWindowHandle["exportAsPng"]>(
      async ({ fileName = "window-drawing.png", scale = 2, backgroundColor = style.background } = {}) => {
        const svgElement = svgRef.current;
        if (!svgElement) {
          throw new Error("SVG element not available");
        }

        const serializer = new XMLSerializer();
        const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
        clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        const svgString = serializer.serializeToString(clonedSvg);

        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = (event) => reject(event);
          image.src = url;
        });

        try {
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(width * scale);
          canvas.height = Math.floor(height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            throw new Error("Unable to acquire 2D context for export canvas");
          }
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL("image/png");
          const anchor = document.createElement("a");
          anchor.href = dataUrl;
          anchor.download = fileName;
          anchor.click();
        } finally {
          URL.revokeObjectURL(url);
        }
      },
      [height, style.background, width],
    );

    useImperativeHandle(ref, () => ({ exportAsPng }), [exportAsPng]);

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        role="img"
        aria-label="Parametric window elevation"
      >
        <defs>
          <style>{`
            .window-text { font-family: 'Inter', sans-serif; fill: ${style.dimensionColor}; }
            .pane-text { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; fill: #0f172a; }
          `}</style>
        </defs>
        <rect width={width} height={height} fill={style.background} />

        {/* Outer frame */}
        <rect
          x={scaling.originPx.x}
          y={scaling.originPx.y}
          width={mmToPx(config.widthMm, scaling.pxPerMm)}
          height={mmToPx(config.heightMm, scaling.pxPerMm)}
          fill={style.frameFill}
          rx={4}
          ry={4}
        />

        {/* Inner reveal */}
        <rect
          x={innerOrigin.x}
          y={innerOrigin.y}
          width={interiorWidthPx}
          height={interiorHeightPx}
          fill="#f8fafc"
        />

        {/* Vertical mullions */}
        {config.columns.slice(0, -1).map((_, idx) => {
          const xMm = columnOffsetMm(config, idx) + config.columns[idx];
          const xPx = scaling.originPx.x + mmToPx(xMm, scaling.pxPerMm);
          return (
            <rect
              key={`mullion-${idx}`}
              x={xPx}
              y={innerOrigin.y}
              width={mullionThicknessPx}
              height={interiorHeightPx}
              fill={style.mullionFill}
            />
          );
        })}

        {/* Horizontal transoms */}
        {config.rows.slice(0, -1).map((_, idx) => {
          const yMm = rowOffsetMm(config, idx) + config.rows[idx];
          const yPx = scaling.originPx.y + mmToPx(yMm, scaling.pxPerMm);
          return (
            <rect
              key={`transom-${idx}`}
              x={innerOrigin.x}
              y={yPx}
              width={interiorWidthPx}
              height={transomThicknessPx}
              fill={style.mullionFill}
            />
          );
        })}

        {/* Glass panes & sash symbols */}
        {config.rows.map((rowHeightMm, rowIdx) => {
          const rowStartMm = rowOffsetMm(config, rowIdx);
          const rowStartPx = scaling.originPx.y + mmToPx(rowStartMm, scaling.pxPerMm);
          const cellHeightPx = mmToPx(rowHeightMm, scaling.pxPerMm);
          const glassHeightPx = Math.max(cellHeightPx - glassInsetPx * 2, 0);

          return config.columns.map((columnWidthMm, columnIdx) => {
            const columnStartMm = columnOffsetMm(config, columnIdx);
            const columnStartPx = scaling.originPx.x + mmToPx(columnStartMm, scaling.pxPerMm);
            const cellWidthPx = mmToPx(columnWidthMm, scaling.pxPerMm);
            const glassWidthPx = Math.max(cellWidthPx - glassInsetPx * 2, 0);
            const paneX = columnStartPx + glassInsetPx;
            const paneY = rowStartPx + glassInsetPx;
            const paneCenterX = columnStartPx + cellWidthPx / 2;
            const paneCenterY = rowStartPx + cellHeightPx / 2;
            const key = `${columnIdx}-${rowIdx}`;
            const opening = sashMap.get(key);

            return (
              <g key={`pane-${key}`}>
                <rect
                  x={paneX}
                  y={paneY}
                  width={glassWidthPx}
                  height={glassHeightPx}
                  fill={style.glassFill}
                  stroke={style.glassStroke}
                  strokeWidth={1}
                  rx={2}
                  ry={2}
                />
                <text x={paneX + glassWidthPx / 2} y={paneY + glassHeightPx / 2 + 4} className="pane-text" textAnchor="middle">
                  {`${Math.round(columnWidthMm)} Ã— ${Math.round(rowHeightMm)} mm`}
                </text>
                {opening
                  ? renderOpeningGlyph(opening, paneCenterX, paneCenterY, glassWidthPx, glassHeightPx, style.glassStroke)
                  : null}
              </g>
            );
          });
        })}

        {showDimensions ? (
          <>
            {/* Overall width */}
            <DimensionLines
              orientation="horizontal"
              origin={{ x: scaling.originPx.x, y: scaling.originPx.y }}
              totalMm={config.widthMm}
              segments={outerSegmentsHorizontal}
              pxPerMm={scaling.pxPerMm}
              offsetPx={48}
              color={style.dimensionColor}
              fontSize={style.dimensionFontSize}
              id="overall-width"
            />
            {/* Module widths */}
            <DimensionLines
              orientation="horizontal"
              origin={{ x: innerOrigin.x, y: scaling.originPx.y + mmToPx(config.heightMm, scaling.pxPerMm) }}
              totalMm={interiorWidthMm}
              segments={config.columns}
              pxPerMm={scaling.pxPerMm}
              offsetPx={-56}
              color={style.dimensionColor}
              fontSize={style.dimensionFontSize}
              id="module-widths"
            />
            {/* Overall height */}
            <DimensionLines
              orientation="vertical"
              origin={{ x: scaling.originPx.x, y: scaling.originPx.y }}
              totalMm={config.heightMm}
              segments={outerSegmentsVertical}
              pxPerMm={scaling.pxPerMm}
              offsetPx={48}
              color={style.dimensionColor}
              fontSize={style.dimensionFontSize}
              id="overall-height"
            />
            {/* Module heights */}
            <DimensionLines
              orientation="vertical"
              origin={{ x: scaling.originPx.x + mmToPx(config.widthMm, scaling.pxPerMm), y: innerOrigin.y }}
              totalMm={interiorHeightMm}
              segments={config.rows}
              pxPerMm={scaling.pxPerMm}
              offsetPx={-56}
              color={style.dimensionColor}
              fontSize={style.dimensionFontSize}
              id="module-height"
            />
          </>
        ) : null}
      </svg>
    );
  },
);

ParametricWindowSVG.displayName = "ParametricWindowSVG";

function renderOpeningGlyph(
  opening: OpeningDirection,
  centerX: number,
  centerY: number,
  widthPx: number,
  heightPx: number,
  stroke: string,
) {
  if (widthPx <= 0 || heightPx <= 0) {
    return null;
  }

  const arrowLength = Math.min(widthPx, heightPx) * 0.35;
  const arrowWidth = arrowLength * 0.5;
  const strokeWidth = 2;

  switch (opening) {
    case OpeningDirection.LeftHinged:
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none">
          <line x1={centerX} y1={centerY} x2={centerX - arrowLength} y2={centerY} />
          <polyline points={`${centerX - arrowLength},${centerY} ${centerX - arrowLength + arrowWidth},${centerY - arrowWidth} ${centerX - arrowLength + arrowWidth},${centerY + arrowWidth}`} />
        </g>
      );
    case OpeningDirection.RightHinged:
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none">
          <line x1={centerX} y1={centerY} x2={centerX + arrowLength} y2={centerY} />
          <polyline points={`${centerX + arrowLength},${centerY} ${centerX + arrowLength - arrowWidth},${centerY - arrowWidth} ${centerX + arrowLength - arrowWidth},${centerY + arrowWidth}`} />
        </g>
      );
    case OpeningDirection.TiltTurnLeft:
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none">
          <line x1={centerX} y1={centerY} x2={centerX - arrowLength} y2={centerY - arrowLength} />
          <polyline points={`${centerX - arrowLength},${centerY - arrowLength} ${centerX - arrowLength + arrowWidth},${centerY - arrowLength} ${centerX - arrowLength},${centerY - arrowLength + arrowWidth}`} />
          <line x1={centerX} y1={centerY} x2={centerX} y2={centerY + arrowLength} />
        </g>
      );
    case OpeningDirection.TiltTurnRight:
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" fill="none">
          <line x1={centerX} y1={centerY} x2={centerX + arrowLength} y2={centerY - arrowLength} />
          <polyline points={`${centerX + arrowLength},${centerY - arrowLength} ${centerX + arrowLength - arrowWidth},${centerY - arrowLength} ${centerX + arrowLength},${centerY - arrowLength + arrowWidth}`} />
          <line x1={centerX} y1={centerY} x2={centerX} y2={centerY + arrowLength} />
        </g>
      );
    default:
      return null;
  }
}