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
      select: { id: true, name: true, email: true, image: true, accentColor: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, image: true, accentColor: true, role: true, _count: { select: { artists: true } } },
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 md:pt-12 grid gap-12">
      <section>
        <div className="mb-8">
          <span className="tag">Zone admin</span>
          <h1 className="display outlined t-h1 a-drop mt-2" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
            Validations
          </h1>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="shape panel card">
            <div className="empty">
              <span className="shape slab display t-h3" style={{ "--tilt": "-3deg" } as React.CSSProperties}>
                Personne en attente
              </span>
              <p className="muted max-w-xs">Aucun utilisateur en attente de validation.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user, index) => (
              <div
                key={user.id}
                className="shape paper card on-paper tilt flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ "--tilt": `${index % 2 ? 0.8 : -0.8}deg` } as React.CSSProperties}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <UserAvatar image={user.image} name={user.name} accentColor={user.accentColor} className="w-12 h-12 text-xl" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">{user.name || "Sans nom"}</p>
                    <p className="text-sm ink-muted truncate">{user.email}</p>
                    <p className="text-xs ink-muted font-semibold">
                      Inscrit le {user.createdAt.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form action={approveUser.bind(null, user.id)}>
                    <button className="btn btn--dark btn--sm">
                      <span>Valider ▸</span>
                    </button>
                  </form>
                  <form action={deleteUser.bind(null, user.id)}>
                    <button className="btn btn--danger btn--sm">
                      <span>Refuser</span>
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="shape panel card">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <h2 className="display t-h2">Membres</h2>
          <span className="tag">{members.length}</span>
        </div>
        <div className="grid gap-3">
          {members.map((user, index) => {
            const isSelf = user.id === session.user.id;
            const isAdmin = user.role === "ADMIN";
            return (
              <div
                key={user.id}
                className="shape raised row flex-col items-stretch sm:flex-row sm:items-center justify-between"
                style={{ "--tilt": `${index % 2 ? 0.35 : -0.35}deg` } as React.CSSProperties}
              >
                <Link href={`/profile/${user.id}`} className="flex items-center gap-3 min-w-0 group">
                  <UserAvatar image={user.image} name={user.name} accentColor={user.accentColor} className="w-10 h-10" />
                  <div className="min-w-0">
                    <p className="font-bold truncate group-hover:text-accent">
                      {user.name || "Sans nom"}
                      {isAdmin && (
                        <span className="stamp stamp--accent text-xs ml-3 align-middle" style={{ "--tilt": "-6deg" } as React.CSSProperties}>
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs muted font-semibold truncate">
                      {user.email} · {user._count.artists} DJs
                    </p>
                  </div>
                </Link>
                {!isSelf && (
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleAdmin.bind(null, user.id, !isAdmin)}>
                      <button className="btn btn--dark btn--sm">
                        <span>{isAdmin ? "Retirer admin" : "Passer admin"}</span>
                      </button>
                    </form>
                    <form action={deleteUser.bind(null, user.id)}>
                      <button className="btn btn--danger btn--sm">
                        <span>Supprimer</span>
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
