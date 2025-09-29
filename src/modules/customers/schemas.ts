import { z } from "zod";

export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Customer name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCustomerSchema = customerSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    email: z.string().email().optional(),
  });

export const updateCustomerSchema = createCustomerSchema.partial();

export type Customer = z.infer<typeof customerSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
