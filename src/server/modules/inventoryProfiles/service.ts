import { prisma } from "@/server/db/client";
import {
  CreateInventoryProfileInput,
  UpdateInventoryProfileInput,
  createInventoryProfileSchema,
  updateInventoryProfileSchema,
} from "@/modules/inventory-profiles/schemas";

export async function listInventoryProfiles() {
  return prisma.inventoryProfile.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getInventoryProfileById(id: string) {
  return prisma.inventoryProfile.findUnique({
    where: { id },
    include: {
      cutPlanItems: true,
    },
  });
}

export async function createInventoryProfile(input: unknown) {
  const data = createInventoryProfileSchema.parse(input) as CreateInventoryProfileInput;
  return prisma.inventoryProfile.create({ data });
}

export async function updateInventoryProfile(id: string, input: unknown) {
  const data = updateInventoryProfileSchema.parse(input) as UpdateInventoryProfileInput;
  return prisma.inventoryProfile.update({ where: { id }, data });
}

export async function deleteInventoryProfile(id: string) {
  await prisma.inventoryProfile.delete({ where: { id } });
}