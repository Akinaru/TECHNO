import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProfileArtistList } from "@/components/profile/ProfileArtistList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditableAvatar } from "@/components/profile/EditableAvatar";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      artists: {
        include: { 
          artist: {
            include: {
              seenBy: {
                where: {
                  NOT: {
                    userId: id
                  }
                },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true
                    }
                  }
                },
                take: 6
              }
            }
          }
        },
        orderBy: { artist: { name: 'asc' } }
      }
    }
  });

  if (!user || !user.isApproved) {
    notFound();
  }

  const isOwnProfile = session?.user.id === user.id;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-12 md:mb-16">
        <EditableAvatar 
          image={user.image} 
          name={user.name} 
          userId={user.id}
          isOwnProfile={isOwnProfile}
        />
        <div className="text-center sm:text-left overflow-hidden w-full">
          <h1 className="text-3xl sm:text-5xl font-black mb-1 text-sunset uppercase tracking-tighter italic pr-4 break-words">Palmarès de {user.name}</h1>
          <p className="text-white/60 font-black uppercase tracking-widest text-xs sm:text-sm italic pr-2">
            <span className="text-sunset-orange">{user.artists.length}</span> artistes vus au total
          </p>
        </div>
      </div>

      <ProfileArtistList initialArtists={user.artists as any} />
    </div>
  );
}
