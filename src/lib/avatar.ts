import { prisma } from "@/lib/prisma";

export const AVATAR_MAX_BYTES = 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function avatarUrl(userId: string, version: Date) {
  return `/api/avatars/${userId}?v=${version.getTime()}`;
}

// Validates an uploaded file and stores it in the database, returning the public URL.
export async function saveAvatar(userId: string, file: File) {
  if (!AVATAR_MIME_TYPES.includes(file.type)) {
    throw new Error("Format non supporté (JPEG, PNG ou WebP)");
  }
  if (file.size === 0 || file.size > AVATAR_MAX_BYTES) {
    throw new Error("Image trop volumineuse (max 1Mo)");
  }

  const data = Buffer.from(await file.arrayBuffer());
  const avatar = await prisma.avatar.upsert({
    where: { userId },
    create: { userId, data, mimeType: file.type },
    update: { data, mimeType: file.type },
  });

  const image = avatarUrl(userId, avatar.updatedAt);
  await prisma.user.update({ where: { id: userId }, data: { image } });
  return image;
}

export async function deleteAvatar(userId: string) {
  await prisma.$transaction([
    prisma.avatar.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { image: null } }),
  ]);
}
