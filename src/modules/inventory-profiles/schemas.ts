import { z } from "zod";

export const inventoryProfileSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  profileType: z.string().nullable().optional(),
  lengthMm: z.number().int().positive(),
  stockQuantity: z.number().int().nonnegative(),
  scrapAllowanceMm: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createInventoryProfileSchema = inventoryProfileSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    metadata: z.record(z.string(), z.any()).nullable().optional(),
  });

export const updateInventoryProfileSchema = createInventoryProfileSchema.partial();

export type InventoryProfile = z.infer<typeof inventoryProfileSchema>;
export type CreateInventoryProfileInput = z.infer<typeof createInventoryProfileSchema>;
export type UpdateInventoryProfileInput = z.infer<typeof updateInventoryProfileSchema>;