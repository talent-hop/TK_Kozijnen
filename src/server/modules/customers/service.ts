import { createCustomerSchema, updateCustomerSchema } from "@/modules/customers/schemas";
import { prisma } from "@/server/db/client";

export async function listCustomers() {
  return prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });
}

export async function createCustomer(input: unknown) {
  const data = createCustomerSchema.parse(input);
  return prisma.customer.create({ data });
}

export async function updateCustomer(id: string, input: unknown) {
  const data = updateCustomerSchema.parse(input);
  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
}

export async function getCustomerById(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}
