import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { saveAvatar } from "@/lib/avatar";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const image = formData.get("image");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    if (name.length > 40) {
      return NextResponse.json({ error: "Pseudo trop long (40 caractères max)" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Mot de passe trop court (8 caractères min)" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    if (image instanceof File && image.size > 0) {
      try {
        await saveAvatar(user.id, image);
      } catch (uploadError) {
        // The account is still valid without a picture
        console.error("Error saving avatar:", uploadError);
      }
    }

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      message: "Compte créé avec succès. En attente de validation par un administrateur."
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({
      error: "Une erreur est survenue lors de l'inscription",
    }, { status: 500 });
  }
}
