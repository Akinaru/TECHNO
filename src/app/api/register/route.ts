import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { name, email, password, image } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    let imagePath = null;

    // Handle image saving if provided as base64
    if (image && image.startsWith("data:image")) {
      try {
        const base64Data = image.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        
        // Extract extension
        const mimeType = image.split(";")[0].split(":")[1];
        const extension = mimeType.split("/")[1] || "png";
        
        const filename = `${uuidv4()}.${extension}`;
        const relativePath = `/uploads/avatars/${filename}`;
        const absolutePath = path.join(process.cwd(), "public", "uploads", "avatars", filename);
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        
        await fs.writeFile(absolutePath, buffer);
        imagePath = relativePath;
      } catch (uploadError) {
        console.error("Error saving image:", uploadError);
        // Continue without image if saving fails
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: imagePath,
      },
    });

    return NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email },
      message: "Compte créé avec succès. En attente de validation par un administrateur." 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({ 
      error: "Une erreur est survenue lors de l'inscription",
      details: error.message 
    }, { status: 500 });
  }
}
