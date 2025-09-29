import { z } from "zod";
import { projectStatusValues } from "@/modules/shared/constants";

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  reference: z.string().optional(),
  status: z.enum(projectStatusValues),
  customerId: z.string().uuid(),
  address: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProjectSchema = projectSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    status: z.enum(projectStatusValues).default("PLANNING"),
  });

export const updateProjectSchema = createProjectSchema.partial();

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
