import { z } from "zod";
import { cutPlanStrategyValues, cutPlanStatusValues } from "./constants";

export const cutRequirementSchema = z.object({
  lengthMm: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  profileId: z.string().uuid().optional(),
  profileType: z.string().optional(),
});

export const cutPlanItemSchema = z.object({
  id: z.string().uuid(),
  cutPlanId: z.string().uuid(),
  inventoryProfileId: z.string().uuid(),
  sourceLengthMm: z.number().int().positive(),
  usedLengthMm: z.number().int().nonnegative(),
  wasteLengthMm: z.number().int().nonnegative(),
  segments: z.array(z.number().int().positive()),
  createdAt: z.coerce.date(),
});

export const cutPlanSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  wallId: z.string().uuid().nullable().optional(),
  strategy: z.enum(cutPlanStrategyValues),
  status: z.enum(cutPlanStatusValues),
  summary: z.record(z.string(), z.any()).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(cutPlanItemSchema).optional(),
});

export const createCutPlanSchema = z.object({
  projectId: z.string().uuid(),
  wallId: z.string().uuid().nullable().optional(),
  strategy: z.enum(cutPlanStrategyValues).default("GREEDY"),
  requirements: z.array(cutRequirementSchema).optional(),
});

export type CutRequirement = z.infer<typeof cutRequirementSchema>;
export type CutPlanItem = z.infer<typeof cutPlanItemSchema>;
export type CutPlan = z.infer<typeof cutPlanSchema>;
export type CreateCutPlanInput = z.infer<typeof createCutPlanSchema>;