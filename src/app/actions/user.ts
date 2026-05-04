"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

// I'll check where authOptions is exported. layout.tsx used @/lib/auth.
// Wait, I saw src/lib/auth.ts and src/lib/options.ts earlier. 
// Let me check src/lib/auth.ts and src/lib/options.ts

export async function updateAvatarAction(base64Image: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    throw new Error("Non autorisé");
  }

  try {
    const base64Data = base64Image.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    
    // Extract extension
    const mimeType = base64Image.split(";")[0].split(":")[1];
    const extension = mimeType.split("/")[1] || "png";
    
    const filename = `${uuidv4()}.${extension}`;
    const relativePath = `/uploads/avatars/${filename}`;
    const absolutePath = path.join(process.cwd(), "public", "uploads", "avatars", filename);
    
    // Ensure directory exists (it should, but just in case)
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    
    await fs.writeFile(absolutePath, buffer);
    
    // Delete old image if it's a local upload
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    });
    
    if (user?.image && user.image.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), "public", user.image);
      try {
        await fs.unlink(oldPath);
      } catch (e) {
        console.error("Failed to delete old avatar:", e);
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: relativePath },
    });

    revalidatePath(`/profile/${session.user.id}`);
    revalidatePath("/users");
    
    return { success: true, image: relativePath };
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    throw new Error("Erreur lors de la mise à jour de l'avatar");
  }
}
