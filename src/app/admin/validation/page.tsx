import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { UserAvatar } from "@/components/ui/UserAvatar";
import Link from "next/link";

export default async function AdminValidationPage() {
  const session = await requireAdmin();

  const [pendingUsers, members] = await Promise.all([
    prisma.user.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, image: true, role: true, _count: { select: { artists: true } } },
    }),
  ]);

  async function approveUser(userId: string) {
    "use server";
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });
    revalidatePath("/", "layout");
  }

  async function deleteUser(userId: string) {
    "use server";
    const admin = await requireAdmin();
    if (userId === admin.user.id) return;
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/", "layout");
  }

  async function toggleAdmin(userId: string, makeAdmin: boolean) {
    "use server";
    const admin = await requireAdmin();
    if (userId === admin.user.id) return;
    await prisma.user.update({
      where: { id: userId },
      data: { role: makeAdmin ? "ADMIN" : "USER" },
    });
    revalidatePath("/admin/validation");
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
      <section>
        <h1 className="text-3xl font-black mb-8 text-sunset uppercase tracking-tighter italic pr-4">Validations</h1>

        {pendingUsers.length === 0 ? (
          <p className="text-white/50 italic">Aucun utilisateur en attente de validation.</p>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <UserAvatar image={user.image} name={user.name} className="w-12 h-12 text-xl" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{user.name || "Sans nom"}</p>
                    <p className="text-sm text-white/60 truncate">{user.email}</p>
                    <p className="text-xs text-white/40">Inscrit le {user.createdAt.toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <form action={approveUser.bind(null, user.id)}>
                    <button className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                      Valider
                    </button>
                  </form>
                  <form action={deleteUser.bind(null, user.id)}>
                    <button className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                      Refuser
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter italic pr-2 border-b border-white/10 pb-4">
          Membres <span className="text-white/30">({members.length})</span>
        </h2>
        <div className="grid gap-3">
          {members.map((user) => {
            const isSelf = user.id === session.user.id;
            const isAdmin = user.role === "ADMIN";
            return (
              <div key={user.id} className="bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-3 min-w-0 group">
                  <UserAvatar image={user.image} name={user.name} className="w-10 h-10" />
                  <div className="min-w-0">
                    <p className="font-bold truncate group-hover:text-sunset-orange transition-colors">
                      {user.name || "Sans nom"}
                      {isAdmin && <span className="ml-2 text-[9px] font-black uppercase tracking-widest bg-sunset px-2 py-0.5 rounded-full align-middle">Admin</span>}
                    </p>
                    <p className="text-xs text-white/40 truncate">{user.email} · {user._count.artists} DJs</p>
                  </div>
                </Link>
                {!isSelf && (
                  <div className="flex gap-2">
                    <form action={toggleAdmin.bind(null, user.id, !isAdmin)}>
                      <button className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer">
                        {isAdmin ? "Retirer admin" : "Passer admin"}
                      </button>
                    </form>
                    <form action={deleteUser.bind(null, user.id)}>
                      <button className="bg-red-500/10 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer">
                        Supprimer
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
