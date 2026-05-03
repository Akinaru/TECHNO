import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserAvatar } from "@/components/ui/UserAvatar";

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
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-black mb-8 text-sunset text-center uppercase tracking-tighter">LE CREW</h1>
      
      <div className="grid gap-4">
        {users.map((user) => (
          <Link href={`/profile/${user.id}`} key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-sunset-orange transition-colors group">
            <div className="flex items-center gap-4">
              <UserAvatar 
                image={user.image} 
                name={user.name} 
                className="w-16 h-16 text-2xl"
              />
              <div>
                <h2 className="font-bold text-xl group-hover:text-sunset-orange transition-colors">
                  {user.id === session?.user?.id ? `${user.name} (Toi)` : user.name}
                </h2>
                <p className="text-white/50 text-sm">Membre depuis {new Date(user.createdAt).getFullYear()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-2xl text-sunset-orange">{user._count.artists}</p>
              <p className="text-[10px] text-white/50 uppercase font-black">DJs vus</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
