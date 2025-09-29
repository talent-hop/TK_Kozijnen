import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
} from "@/modules/inventory/schemas";
import { prisma } from "@/server/db/client";

export async function listInventoryItems() {
  return prisma.inventoryItem.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createInventoryItem(input: unknown) {
  const data = createInventoryItemSchema.parse(input);
  return prisma.inventoryItem.create({ data });
}

export async function updateInventoryItem(id: string, input: unknown) {
  const data = updateInventoryItemSchema.parse(input);
  return prisma.inventoryItem.update({ where: { id }, data });
}

export async function deleteInventoryItem(id: string) {
  await prisma.inventoryItem.delete({ where: { id } });
}

export async function getInventoryItemById(id: string) {
  return prisma.inventoryItem.findUnique({ where: { id } });
}
