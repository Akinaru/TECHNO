import { prisma } from "@/lib/prisma";

export async function getOption(key: string) {
  const option = await prisma.option.findUnique({
    where: { key },
  });
  return option?.value || null;
}

export async function setOption(key: string, value: string) {
  return await prisma.option.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
