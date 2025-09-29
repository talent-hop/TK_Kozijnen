import { createProjectSchema, updateProjectSchema } from "@/modules/projects/schemas";
import { prisma } from "@/server/db/client";

export async function listProjects() {
  return prisma.project.findMany({
    include: {
      customer: true,
      windowFrames: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProject(input: unknown) {
  const data = createProjectSchema.parse(input);
  return prisma.project.create({ data });
}

export async function updateProject(id: string, input: unknown) {
  const data = updateProjectSchema.parse(input);
  return prisma.project.update({ where: { id }, data });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      windowFrames: true,
      invoices: true,
    },
  });
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
}
