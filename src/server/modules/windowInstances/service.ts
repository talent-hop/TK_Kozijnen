import { prisma } from "@/server/db/client";
import {
  CreateWindowInstanceInput,
  UpdateWindowInstanceInput,
  createWindowInstanceSchema,
  updateWindowInstanceSchema,
} from "@/modules/window-instances/schemas";

export async function listWindowInstances(params: { wallId?: string; projectId?: string }) {
  const { wallId, projectId } = params;
  return prisma.windowInstance.findMany({
    where: {
      wallId,
      wall: projectId ? { projectId } : undefined,
    },
    include: {
      wall: true,
      windowFrame: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWindowInstanceById(id: string) {
  return prisma.windowInstance.findUnique({
    where: { id },
    include: {
      wall: true,
      windowFrame: true,
    },
  });
}

export async function createWindowInstance(input: unknown) {
  const data = createWindowInstanceSchema.parse(input) as CreateWindowInstanceInput;
  return prisma.windowInstance.create({ data });
}

export async function updateWindowInstance(id: string, input: unknown) {
  const data = updateWindowInstanceSchema.parse(input) as UpdateWindowInstanceInput;
  return prisma.windowInstance.update({ where: { id }, data });
}

export async function deleteWindowInstance(id: string) {
  await prisma.windowInstance.delete({ where: { id } });
}