import { Prisma } from "@prisma/client";
import {
  createWindowFrameSchema,
  updateWindowFrameSchema,
} from "@/modules/window-frames/schemas";
import { prisma } from "@/server/db/client";

const windowFrameQuery = {
  include: {
    project: {
      select: {
        id: true,
        name: true,
      },
    },
  },
} satisfies Prisma.WindowFrameFindManyArgs;

type WindowFrameRecord = Prisma.WindowFrameGetPayload<typeof windowFrameQuery>;

type CostInput = {
  costProfiles?: number;
  costGlazing?: number;
  costHardware?: number;
  unitPrice?: number | null;
};

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return typeof value === "number" ? value : Number(value);
}

function transformWindowFrame(frame: WindowFrameRecord) {
  const costProfiles = decimalToNumber(frame.costProfiles);
  const costGlazing = decimalToNumber(frame.costGlazing);
  const costHardware = decimalToNumber(frame.costHardware);
  const unitPriceValue = frame.unitPrice === null ? null : decimalToNumber(frame.unitPrice);

  return {
    ...frame,
    unitPrice: unitPriceValue,
    costProfiles,
    costGlazing,
    costHardware,
    costBreakdown: {
      profiles: costProfiles,
      glazing: costGlazing,
      hardware: costHardware,
      total: costProfiles + costGlazing + costHardware,
    },
  };
}

function deriveUnitPrice(input: CostInput) {
  if (input.unitPrice !== undefined && input.unitPrice !== null) {
    return input.unitPrice;
  }

  const { costProfiles = 0, costGlazing = 0, costHardware = 0 } = input;

  return costProfiles + costGlazing + costHardware;
}

export async function listWindowFrames(projectId?: string) {
  const frames = await prisma.windowFrame.findMany({
    ...(projectId ? { where: { projectId } } : {}),
    ...windowFrameQuery,
    orderBy: { createdAt: "desc" },
  });

  return frames.map(transformWindowFrame);
}

export async function createWindowFrame(input: unknown) {
  const data = createWindowFrameSchema.parse(input);
  const created = await prisma.windowFrame.create({
    data: {
      ...data,
      unitPrice: deriveUnitPrice(data),
    },
    ...windowFrameQuery,
  });

  return transformWindowFrame(created);
}

export async function updateWindowFrame(id: string, input: unknown) {
  const data = updateWindowFrameSchema.parse(input);

  let payload: Prisma.WindowFrameUpdateInput = { ...data };

  if (
    data.unitPrice === undefined &&
    (data.costProfiles !== undefined ||
      data.costGlazing !== undefined ||
      data.costHardware !== undefined)
  ) {
    const existing = await prisma.windowFrame.findUnique({
      where: { id },
      select: {
        costProfiles: true,
        costGlazing: true,
        costHardware: true,
      },
    });

    if (!existing) {
      throw new Error(`Window frame ${id} not found`);
    }

    const derived = deriveUnitPrice({
      unitPrice: null,
      costProfiles: data.costProfiles ?? decimalToNumber(existing.costProfiles),
      costGlazing: data.costGlazing ?? decimalToNumber(existing.costGlazing),
      costHardware: data.costHardware ?? decimalToNumber(existing.costHardware),
    });

    payload = { ...payload, unitPrice: derived };
  }

  const updated = await prisma.windowFrame.update({
    where: { id },
    data: payload,
    ...windowFrameQuery,
  });

  return transformWindowFrame(updated);
}

export async function deleteWindowFrame(id: string) {
  await prisma.windowFrame.delete({ where: { id } });
}

export async function getWindowFrameById(id: string) {
  const frame = await prisma.windowFrame.findUnique({
    where: { id },
    ...windowFrameQuery,
  });

  return frame ? transformWindowFrame(frame) : null;
}