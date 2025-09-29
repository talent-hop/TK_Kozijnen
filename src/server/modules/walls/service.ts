import { prisma } from "@/server/db/client";
import {
  CreateWallInput,
  UpdateWallInput,
  createWallSchema,
  updateWallSchema,
} from "@/modules/walls/schemas";

export async function listWalls(projectId?: string) {
  return prisma.wall.findMany({
    where: projectId ? { projectId } : undefined,
    include: {
      windows: {
        include: {
          windowFrame: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWallById(id: string) {
  return prisma.wall.findUnique({
    where: { id },
    include: {
      windows: {
        include: {
          windowFrame: true,
        },
        orderBy: { createdAt: "desc" },
      },
      project: true,
    },
  });
}

export async function createWall(input: unknown) {
  const data = createWallSchema.parse(input);
  return prisma.wall.create({ data });
}

export async function updateWall(id: string, input: unknown) {
  const data = updateWallSchema.parse(input);
  return prisma.wall.update({ where: { id }, data });
}

export async function deleteWall(id: string) {
  await prisma.wall.delete({ where: { id } });
}