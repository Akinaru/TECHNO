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
import { getPalmares, computeStats, getCompatibility } from "@/lib/palmares";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, image: true, isApproved: true, createdAt: true },
  });

  if (!user || !user.isApproved) {
    notFound();
  }

  const isOwnProfile = session?.user.id === user.id;
  const [palmares, compatibility] = await Promise.all([
    getPalmares(user.id),
    session && !isOwnProfile ? getCompatibility(session.user.id, user.id) : null,
  ]);
  const stats = computeStats(palmares);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-10">
        <EditableAvatar
          image={user.image}
          name={user.name}
          isOwnProfile={isOwnProfile}
        />
        <div className="text-center sm:text-left overflow-hidden w-full">
          <h1 className="text-3xl sm:text-5xl font-black mb-1 text-sunset uppercase tracking-tighter italic pr-4 break-words">Palmarès de {user.name}</h1>
          <p className="text-white/60 font-black uppercase tracking-widest text-xs sm:text-sm italic pr-2">
            Dans le crew depuis {user.createdAt.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </p>
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
            <ShareButton title={`Le TechnoDex de ${user.name}`} />
            {isOwnProfile && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                <Settings size={14} /> Paramètres
              </Link>
            )}
          </div>
        </div>
      </div>

      {compatibility && (
        <div className="mb-8 bg-sunset/10 border border-sunset-orange/30 rounded-2xl p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic pr-2">Compatibilité avec toi</p>
            <p className="text-3xl font-black text-sunset italic pr-1">{compatibility.score}%</p>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
            <div className="h-full bg-sunset" style={{ width: `${compatibility.score}%` }} />
          </div>
          {compatibility.common.length === 0 ? (
            <p className="text-xs text-white/50 font-bold">Aucun DJ en commun pour l&apos;instant. Prochaine teuf ensemble ?</p>
          ) : (
            <>
              <p className="text-xs text-white/60 font-bold mb-3">
                {compatibility.common.length} DJ{compatibility.common.length > 1 ? "s" : ""} en commun
              </p>
              <div className="flex flex-wrap gap-2">
                {compatibility.common.slice(0, 12).map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="flex items-center gap-2 bg-black/30 hover:bg-black/50 border border-white/10 rounded-full pl-1 pr-3 py-1 transition-colors"
                  >
                    <span className="relative w-6 h-6 rounded-full overflow-hidden bg-black/50 shrink-0">
                      {artist.image && <Image src={artist.image} alt="" fill sizes="24px" className="object-cover" />}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{artist.name}</span>
                  </Link>
                ))}
                {compatibility.common.length > 12 && (
                  <span className="text-[10px] font-black text-white/40 self-center">+{compatibility.common.length - 12}</span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <ProfileStats stats={stats} />

      <ProfileArtistList initialArtists={palmares} isOwnProfile={isOwnProfile} />
    </div>
  );
}
