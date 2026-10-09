import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { SettingsForms } from "@/components/settings/SettingsForms";

export default async function SettingsPage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  });

  if (!user) notFound();

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <h1 className="text-3xl sm:text-5xl font-black mb-8 text-sunset uppercase tracking-tighter italic pr-4">Paramètres</h1>
      <SettingsForms user={user} />
    </div>
  );
}
