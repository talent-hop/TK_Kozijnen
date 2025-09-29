import { z } from "zod";

export const windowInstanceSchema = z.object({
  id: z.string().uuid(),
  wallId: z.string().uuid(),
  windowFrameId: z.string().uuid().nullable().optional(),
  label: z.string().min(1),
  positionXMm: z.number().int(),
  positionYMm: z.number().int(),
  sillHeightMm: z.number().int(),
  widthMm: z.number().int().positive(),
  heightMm: z.number().int().positive(),
  rotationDeg: z.number().int(),
  config: z.record(z.string(), z.any()).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createWindowInstanceSchema = windowInstanceSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    positionXMm: z.number().int().default(0),
    positionYMm: z.number().int().default(0),
    sillHeightMm: z.number().int().default(0),
    rotationDeg: z.number().int().default(0),
    config: z.record(z.string(), z.any()).nullable().optional(),
  });

export const updateWindowInstanceSchema = createWindowInstanceSchema.partial();

export type WindowInstance = z.infer<typeof windowInstanceSchema>;
export type CreateWindowInstanceInput = z.infer<typeof createWindowInstanceSchema>;
export type UpdateWindowInstanceInput = z.infer<typeof updateWindowInstanceSchema>;