import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: image || null,
        // isApproved is false by default in schema
      },
    });

    return NextResponse.json({ 
      user: { id: user.id, name: user.name, email: user.email },
      message: "Compte créé avec succès. En attente de validation par un administrateur." 
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'inscription" }, { status: 500 });
  }
}
