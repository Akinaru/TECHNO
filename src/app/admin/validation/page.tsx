import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminValidationPage() {
  const pendingUsers = await prisma.user.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "desc" },
  });

  async function approveUser(userId: string) {
    "use server";
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });
    revalidatePath("/admin/validation");
  }

  async function deleteUser(userId: string) {
    "use server";
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/validation");
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-sunset">Validation Utilisateurs</h1>
      
      {pendingUsers.length === 0 ? (
        <p className="text-white/50 italic">Aucun utilisateur en attente de validation.</p>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => (
            <div key={user.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="font-bold">{user.name || "Sans nom"}</p>
                <p className="text-sm text-white/60">{user.email}</p>
                <p className="text-xs text-white/40">Inscrit le {user.createdAt.toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <form action={approveUser.bind(null, user.id)}>
                  <button className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
                    Valider
                  </button>
                </form>
                <form action={deleteUser.bind(null, user.id)}>
                  <button className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer">
                    Refuser
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
