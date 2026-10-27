import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";
import { ProfileArtistList } from "@/components/profile/ProfileArtistList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditableAvatar } from "@/components/profile/EditableAvatar";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ShareButton } from "@/components/profile/ShareButton";
import { getPalmares, computeStats, getCompatibility, getSeenThresholds } from "@/lib/palmares";
import { accentStyle } from "@/lib/accent";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, image: true, accentColor: true, isApproved: true, createdAt: true },
  });

  if (!user || !user.isApproved) {
    notFound();
  }

  const isOwnProfile = session?.user.id === user.id;
  const [palmares, compatibility, seenThresholds] = await Promise.all([
    getPalmares(user.id),
    session && !isOwnProfile ? getCompatibility(session.user.id, user.id) : null,
    getSeenThresholds(),
  ]);
  const stats = computeStats(palmares);

  // The whole profile wears its owner's colour
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12" style={accentStyle(user.accentColor)}>
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-10">
        <EditableAvatar
          image={user.image}
          name={user.name}
          isOwnProfile={isOwnProfile}
        />
        <div className="text-center sm:text-left min-w-0 w-full">
          <span className="tag">
            Dans le crew depuis {user.createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </span>
          <h1 className="display outlined t-h1 a-drop mt-2 break-words" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
            Palmarès de {user.name}
          </h1>
          <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-3">
            <ShareButton title={`Le TechnoDex de ${user.name}`} />
            {isOwnProfile && (
              <Link href="/settings" className="btn btn--sm btn--dark">
                <span>
                  <Settings size={16} strokeWidth={2.5} /> Paramètres
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {compatibility && (
        <div className="shape panel card mb-10">
          <div className="flex items-baseline justify-between gap-4">
            <span className="label">Compatibilité avec toi</span>
            <span className="display accent text-3xl">{compatibility.score}%</span>
          </div>
          <div className="gauge mt-3 mb-5" style={{ "--v": `${compatibility.score}%` } as React.CSSProperties}>
            <b />
          </div>
          {compatibility.common.length === 0 ? (
            <p className="muted t-small font-semibold">Aucun DJ en commun pour l&apos;instant. Prochaine teuf ensemble ?</p>
          ) : (
            <>
              <p className="display text-lg mb-3">
                {compatibility.common.length} DJ{compatibility.common.length > 1 ? "s" : ""} en commun
              </p>
              <div className="chips">
                {compatibility.common.slice(0, 12).map((artist) => (
                  <Link key={artist.id} href={`/artist/${artist.id}`} className="chip">
                    <span className="relative w-6 h-6 overflow-hidden bg-ink border-[0.15rem] border-ink shrink-0">
                      {artist.image && <Image src={artist.image} alt="" fill sizes="24px" className="object-cover" />}
                    </span>
                    <span>{artist.name}</span>
                  </Link>
                ))}
                {compatibility.common.length > 12 && (
                  <span className="tag self-center">+{compatibility.common.length - 12}</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <ProfileStats stats={stats} />

      <ProfileArtistList initialArtists={palmares} isOwnProfile={isOwnProfile} seenThresholds={seenThresholds} />
    </div>
  );
}
