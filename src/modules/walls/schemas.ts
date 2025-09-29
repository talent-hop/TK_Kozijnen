import { z } from "zod";

export const wallSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive().nullable().optional(),
  elevation: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createWallSchema = wallSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    description: z.string().optional(),
    heightMm: z.number().int().positive().optional(),
    elevation: z.string().optional(),
  });

export const updateWallSchema = createWallSchema.partial();

export type Wall = z.infer<typeof wallSchema>;
export type CreateWallInput = z.infer<typeof createWallSchema>;
export type UpdateWallInput = z.infer<typeof updateWallSchema>;