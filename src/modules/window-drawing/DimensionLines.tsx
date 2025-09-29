// src/modules/window-drawing/DimensionLines.tsx
// Reusable SVG dimension line renderer with arrows, ticks, and labels.

import type { FC } from "react";
import { mmToPx } from "./geometry";

export type DimensionOrientation = "horizontal" | "vertical";

export interface DimensionLinesProps {
  orientation: DimensionOrientation;
  /** Origin of the measured geometry in SVG space (px). */
  origin: { x: number; y: number };
  /** Total dimension in millimetres. */
  totalMm: number;
  /** Individual segment lengths in millimetres. */
  segments: number[];
  /** Scale factor (px per mm). */
  pxPerMm: number;
  /** Offset in pixels from the origin to render the dimension line. */
  offsetPx?: number;
  /** Colour applied to strokes and text. */
  color?: string;
  /** Font size in px for dimension labels. */
  fontSize?: number;
  /** Optional key suffix to ensure stable ids. */
  id?: string;
}

const ARROW_SIZE = 8;
const TICK_LENGTH = 10;

export const DimensionLines: FC<DimensionLinesProps> = ({
  orientation,
  origin,
  totalMm,
  segments,
  pxPerMm,
  offsetPx = 24,
  color = "#94a3b8",
  fontSize = 12,
  id = "dim",
}) => {
  if (segments.length === 0) {
    return null;
  }

  const boundaryMm: number[] = [];
  let cumulative = 0;
  for (let index = 0; index < segments.length; index += 1) {
    cumulative += segments[index];
    if (index < segments.length - 1) {
      boundaryMm.push(cumulative);
    }
  }

  if (orientation === "horizontal") {
    const y = origin.y - offsetPx;
    const startX = origin.x;
    const endX = origin.x + mmToPx(totalMm, pxPerMm);
    const labelTop = y - fontSize * 0.6;

    return (
      <g stroke={color} fill={color} fontSize={fontSize} fontFamily="'Inter', ui-sans-serif">
        <line x1={startX} y1={y} x2={endX} y2={y} strokeWidth={1.5} />
        {renderHorizontalArrow(startX, y, -1)}
        {renderHorizontalArrow(endX, y, 1)}
        <text x={(startX + endX) / 2} y={labelTop} textAnchor="middle">
          {formatMillimetres(totalMm)}
        </text>
        {boundaryMm.map((positionMm, boundaryIndex) => {
          const x = origin.x + mmToPx(positionMm, pxPerMm);
          return (
            <line
              key={`h-boundary-${id}-${boundaryIndex}`}
              x1={x}
              y1={y - TICK_LENGTH / 2}
              x2={x}
              y2={y + TICK_LENGTH / 2}
              strokeWidth={1.5}
            />
          );
        })}
        {renderSegmentLabelsHorizontal({
          originX: startX,
          baselineY: y,
          segments,
          pxPerMm,
          color,
          fontSize,
        })}
      </g>
    );
  }

  const x = origin.x - offsetPx;
  const startY = origin.y;
  const endY = origin.y + mmToPx(totalMm, pxPerMm);
  const labelLeft = x - fontSize * 0.6;

  return (
    <g stroke={color} fill={color} fontSize={fontSize} fontFamily="'Inter', ui-sans-serif">
      <line x1={x} y1={startY} x2={x} y2={endY} strokeWidth={1.5} />
      {renderVerticalArrow(x, startY, -1)}
      {renderVerticalArrow(x, endY, 1)}
      <text
        x={labelLeft}
        y={(startY + endY) / 2}
        textAnchor="middle"
        transform={`rotate(-90 ${labelLeft} ${(startY + endY) / 2})`}
      >
        {formatMillimetres(totalMm)}
      </text>
      {boundaryMm.map((positionMm, boundaryIndex) => {
        const yPos = origin.y + mmToPx(positionMm, pxPerMm);
        return (
          <line
            key={`v-boundary-${id}-${boundaryIndex}`}
            x1={x - TICK_LENGTH / 2}
            y1={yPos}
            x2={x + TICK_LENGTH / 2}
            y2={yPos}
            strokeWidth={1.5}
          />
        );
      })}
      {renderSegmentLabelsVertical({
        originY: startY,
        baselineX: x,
        segments,
        pxPerMm,
        color,
        fontSize,
      })}
    </g>
  );
};

function renderHorizontalArrow(x: number, y: number, direction: 1 | -1) {
  const delta = ARROW_SIZE * direction;
  return (
    <path
      d={`M ${x} ${y} L ${x - delta} ${y - ARROW_SIZE / 2} L ${x - delta} ${y + ARROW_SIZE / 2} Z`}
      strokeWidth={0}
    />
  );
}

function renderVerticalArrow(x: number, y: number, direction: 1 | -1) {
  const delta = ARROW_SIZE * direction;
  return (
    <path
      d={`M ${x} ${y} L ${x - ARROW_SIZE / 2} ${y - delta} L ${x + ARROW_SIZE / 2} ${y - delta} Z`}
      strokeWidth={0}
    />
  );
}

function renderSegmentLabelsHorizontal({
  originX,
  baselineY,
  segments,
  pxPerMm,
  color,
  fontSize,
}: {
  originX: number;
  baselineY: number;
  segments: number[];
  pxPerMm: number;
  color: string;
  fontSize: number;
}) {
  const labels = [] as JSX.Element[];
  let runningMm = 0;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const midMm = runningMm + segment / 2;
    const textX = originX + mmToPx(midMm, pxPerMm);
    labels.push(
      <text key={`h-label-${index}`} x={textX} y={baselineY + fontSize + 6} textAnchor="middle" fill={color}>
        {formatMillimetres(segment)}
      </text>,
    );
    runningMm += segment;
  }
  return labels;
}

function renderSegmentLabelsVertical({
  originY,
  baselineX,
  segments,
  pxPerMm,
  color,
  fontSize,
}: {
  originY: number;
  baselineX: number;
  segments: number[];
  pxPerMm: number;
  color: string;
  fontSize: number;
}) {
  const labels = [] as JSX.Element[];
  let runningMm = 0;
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const midMm = runningMm + segment / 2;
    const textY = originY + mmToPx(midMm, pxPerMm);
    labels.push(
      <text
        key={`v-label-${index}`}
        x={baselineX - fontSize - 6}
        y={textY}
        textAnchor="middle"
        fill={color}
        transform={`rotate(-90 ${baselineX - fontSize - 6} ${textY})`}
      >
        {formatMillimetres(segment)}
      </text>,
    );
    runningMm += segment;
  }
  return labels;
}

function formatMillimetres(value: number) {
  return `${Math.round(value)} mm`;
}