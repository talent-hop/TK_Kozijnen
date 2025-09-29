import { z } from "zod";

export const inventoryItemSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.number().int().nonnegative(),
  unit: z.string().min(1, "Unit is required"),
  location: z.string().optional(),
  minQuantity: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const baseInventorySchema = inventoryItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createInventoryItemSchema = baseInventorySchema.extend({
  quantity: z.number().int().nonnegative().default(0),
  minQuantity: z.number().int().nonnegative().optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
