import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const avatar = await prisma.avatar.findUnique({ where: { userId } });

  if (!avatar) {
    return new Response("Not found", { status: 404 });
  }

  // URLs carry a ?v=<timestamp> version, so the content behind one URL never changes.
  return new Response(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
