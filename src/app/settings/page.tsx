import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { SettingsForms } from "@/components/settings/SettingsForms";
import { AccentPicker } from "@/components/settings/AccentPicker";

export default async function SettingsPage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, accentColor: true },
  });

  if (!user) notFound();

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="mb-10">
        <span className="tag">Ton compte</span>
        <h1 className="display outlined t-h1 a-drop mt-2" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
          Paramètres
        </h1>
      </div>
      <div className="grid gap-8">
        <AccentPicker initial={user.accentColor} />
        <SettingsForms user={user} />
      </div>
    </div>
  );
}
