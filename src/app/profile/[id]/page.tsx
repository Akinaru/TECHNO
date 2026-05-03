import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ProfileArtistList } from "@/components/profile/ProfileArtistList";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      artists: {
        include: { artist: true },
        orderBy: { artist: { name: 'asc' } }
      }
    }
  });

  if (!user || !user.isApproved) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-12">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-16">
        <UserAvatar 
          image={user.image} 
          name={user.name} 
          className="w-32 h-32 text-5xl shadow-[0_0_50px_rgba(112,0,255,0.3)]"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-5xl font-black mb-1 text-sunset uppercase tracking-tighter italic pr-4">Palmarès de {user.name}</h1>
          <p className="text-white/60 font-black uppercase tracking-widest text-sm italic pr-2">
            <span className="text-sunset-orange">{user.artists.length}</span> artistes vus au total
          </p>
        </div>
      </div>

      <ProfileArtistList initialArtists={user.artists} />
    </div>
  );
}
