"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { saveAvatar, deleteAvatar } from "@/lib/avatar";
import { isValidAccent } from "@/lib/accent";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

type ActionResult = { success: true; image?: string | null } | { success: false; error: string };

export async function updateAvatarAction(formData: FormData): Promise<ActionResult> {
  const session = await requireUser();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return { success: false, error: "Aucune image reçue" };
  }

  try {
    const image = await saveAvatar(session.user.id, file);
    revalidatePath("/", "layout");
    return { success: true, image };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur lors de l'upload" };
  }
}

export async function removeAvatarAction(): Promise<ActionResult> {
  const session = await requireUser();
  await deleteAvatar(session.user.id);
  revalidatePath("/", "layout");
  return { success: true, image: null };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await requireUser();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { success: false, error: "Le pseudo est requis" };
  if (name.length > 40) return { success: false, error: "Pseudo trop long (40 caractères max)" };

  await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  revalidatePath("/", "layout");
  return { success: true };
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const session = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");

  if (next.length < 8) {
    return { success: false, error: "Nouveau mot de passe trop court (8 caractères min)" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user || !(await bcrypt.compare(current, user.password))) {
    return { success: false, error: "Mot de passe actuel incorrect" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: await bcrypt.hash(next, 10) },
  });
  return { success: true };
}

export async function updateAccentColorAction(color: string | null): Promise<ActionResult> {
  const session = await requireUser();
  if (color !== null && !isValidAccent(color)) {
    return { success: false, error: "Couleur invalide" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { accentColor: color },
  });
  revalidatePath("/", "layout");
  return { success: true };
}
