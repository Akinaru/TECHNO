import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { accentStyle } from "@/lib/accent";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  const users = await prisma.user.findMany({
    where: { isApproved: true },
    include: {
      _count: {
        select: { artists: true }
      }
    },
    orderBy: {
      artists: { _count: 'desc' }
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="mb-10">
        <span className="tag">{users.length} ravers au compteur</span>
        <h1 className="display outlined t-h1 a-drop mt-2" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
          Le crew
        </h1>
      </div>

      <div className="grid gap-4">
        {users.map((user, index) => (
          <Link
            href={`/profile/${user.id}`}
            key={user.id}
            className="shape raised row justify-between group"
            style={{ "--tilt": `${index % 2 ? 0.5 : -0.5}deg`, "--cut": `var(--cut-${"abc"[index % 3]})`, ...accentStyle(user.accentColor) } as React.CSSProperties}
          >
            <div className="flex items-center gap-4 min-w-0">
              <UserAvatar image={user.image} name={user.name} className="w-16 h-16 text-2xl" />
              <div className="min-w-0">
                <h2 className="display t-h3 truncate group-hover:text-accent">
                  {user.id === session?.user?.id ? `${user.name} (Toi)` : user.name}
                </h2>
                <p className="muted text-sm font-semibold">Membre depuis {new Date(user.createdAt).getFullYear()}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="display accent text-3xl">{user._count.artists}</p>
              <p className="label">DJs vus</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
