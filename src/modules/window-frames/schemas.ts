import { z } from "zod";

const dimensionSchema = z.coerce.number().int().positive();
const costSchema = z.coerce.number().nonnegative();

const costBreakdownSchema = z.object({
  profiles: costSchema,
  glazing: costSchema,
  hardware: costSchema,
  total: costSchema,
});

export const windowFrameSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  label: z.string().min(1),
  status: z.string().min(1),
  widthMm: dimensionSchema,
  heightMm: dimensionSchema,
  configuration: z.record(z.string(), z.any()).nullable().optional(),
  materials: z.record(z.string(), z.any()).nullable().optional(),
  unitPrice: z.coerce.number().nonnegative().nullable().optional(),
  costProfiles: costSchema,
  costGlazing: costSchema,
  costHardware: costSchema,
  costBreakdown: costBreakdownSchema.optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const baseWindowFrameSchema = windowFrameSchema.pick({
  projectId: true,
  label: true,
  status: true,
  widthMm: true,
  heightMm: true,
  configuration: true,
  materials: true,
  unitPrice: true,
  costProfiles: true,
  costGlazing: true,
  costHardware: true,
  notes: true,
});

export const createWindowFrameSchema = baseWindowFrameSchema.extend({
  status: z.string().min(1).default("Awaiting glass"),
  costProfiles: costSchema.default(0),
  costGlazing: costSchema.default(0),
  costHardware: costSchema.default(0),
});

export const updateWindowFrameSchema = createWindowFrameSchema.partial();

export type WindowFrame = z.infer<typeof windowFrameSchema>;
export type CreateWindowFrameInput = z.infer<typeof createWindowFrameSchema>;
export type UpdateWindowFrameInput = z.infer<typeof updateWindowFrameSchema>;