import { randomUUID } from "crypto";
import { CutPlanStatus, CutPlanStrategy } from "@prisma/client";
import { prisma } from "@/server/db/client";
import {
  CreateCutPlanInput,
  createCutPlanSchema,
  cutRequirementSchema,
} from "@/modules/cut-plans/schemas";
import { generateCutPlan, StockProfile, CutRequirement } from "@/server/modules/optimization/cutPlanner";

export async function listCutPlans(params: { projectId?: string; wallId?: string }) {
  const { projectId, wallId } = params;
  return prisma.cutPlan.findMany({
    where: {
      projectId,
      wallId,
    },
    include: {
      wall: true,
      project: true,
      items: {
        include: {
          inventoryProfile: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCutPlanById(id: string) {
  return prisma.cutPlan.findUnique({
    where: { id },
    include: {
      wall: true,
      project: true,
      items: {
        include: {
          inventoryProfile: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function deleteCutPlan(id: string) {
  await prisma.cutPlan.delete({ where: { id } });
}

export async function generateCutPlanRecord(input: unknown) {
  const data = createCutPlanSchema.parse(input) as CreateCutPlanInput;

  const requirements = data.requirements
    ? data.requirements.map((req) => cutRequirementSchema.parse(req))
    : await inferRequirements(data.projectId, data.wallId ?? null);

  if (requirements.length === 0) {
    throw new Error("No cut requirements were supplied or could be inferred from the project walls.");
  }

  const inventoryProfiles = await prisma.inventoryProfile.findMany();
  if (inventoryProfiles.length === 0) {
    throw new Error("No inventory profiles are registered; unable to compute a cut plan.");
  }

  const stockProfiles: StockProfile[] = inventoryProfiles.map((profile) => ({
    id: profile.id,
    lengthMm: profile.lengthMm,
    scrapAllowanceMm: profile.scrapAllowanceMm ?? 0,
    stockQuantity: profile.stockQuantity,
    profileType: profile.profileType,
  }));

  const plan = generateCutPlan(data.strategy ?? CutPlanStrategy.GREEDY, stockProfiles, requirements);

  const result = await prisma.$transaction(async (trx) => {
    const cutPlan = await trx.cutPlan.create({
      data: {
        id: randomUUID(),
        projectId: data.projectId,
        wallId: data.wallId ?? null,
        strategy: data.strategy ?? CutPlanStrategy.GREEDY,
        status: CutPlanStatus.COMPLETED,
        summary: plan.summary,
      },
    });

    await Promise.all(
      plan.items.map((item, index) =>
        trx.cutPlanItem.create({
          data: {
            id: randomUUID(),
            cutPlanId: cutPlan.id,
            inventoryProfileId: item.profileId,
            sourceLengthMm: item.sourceLengthMm,
            usedLengthMm: item.usedLengthMm,
            wasteLengthMm: item.wasteLengthMm,
            segments: item.segments,
            createdAt: new Date(Date.now() + index),
          },
        }),
      ),
    );

    return cutPlan.id;
  });

  return getCutPlanById(result);
}

async function inferRequirements(projectId: string, wallId: string | null) {
  const windows = await prisma.windowInstance.findMany({
    where: {
      wall: {
        projectId,
      },
      ...(wallId ? { wallId } : {}),
    },
    include: {
      windowFrame: true,
    },
  });

  const requirements: CutRequirement[] = [];

  for (const instance of windows) {
    const width = instance.widthMm ?? instance.windowFrame?.widthMm ?? 0;
    const height = instance.heightMm ?? instance.windowFrame?.heightMm ?? 0;
    if (width <= 0 || height <= 0) {
      continue;
    }

    const frameType = instance.windowFrame?.materials && typeof instance.windowFrame.materials === "object"
      ? (instance.windowFrame.materials as Record<string, unknown>).frame
      : undefined;

    addRequirement(requirements, { lengthMm: width, quantity: 2, profileType: typeof frameType === "string" ? frameType : undefined });
    addRequirement(requirements, { lengthMm: height, quantity: 2, profileType: typeof frameType === "string" ? frameType : undefined });
  }

  return requirements;
}

function addRequirement(list: CutRequirement[], requirement: CutRequirement) {
  const key = `${requirement.profileId ?? requirement.profileType ?? "*"}|${requirement.lengthMm}`;
  const existing = list.find((item) => {
    const itemKey = `${item.profileId ?? item.profileType ?? "*"}|${item.lengthMm}`;
    return itemKey === key;
  });

  if (existing) {
    existing.quantity += requirement.quantity;
  } else {
    list.push({ ...requirement });
  }
}