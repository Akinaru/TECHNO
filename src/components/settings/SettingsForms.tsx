"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAvatarUpload } from "@/components/profile/useAvatarUpload";
import { updateProfileAction, changePasswordAction } from "@/app/actions/user";

type FormState = { success: boolean; error?: string } | null;

const inputClass =
  "w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:border-sunset-orange focus:ring-4 focus:ring-sunset-orange/10 transition-all outline-none";
const labelClass = "block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 ml-1";
const cardClass = "bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5";
const titleClass = "text-xs uppercase font-black tracking-[0.3em] text-white/60 italic pr-2";
const buttonClass =
  "inline-flex items-center gap-2 bg-sunset px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 cursor-pointer";

function Feedback({ state, successText }: { state: FormState; successText: string }) {
  if (!state) return null;
  return state.success ? (
    <p role="status" className="text-xs font-bold text-green-400">{successText}</p>
  ) : (
    <p role="alert" className="text-xs font-bold text-red-400">{state.error}</p>
  );
}

export function SettingsForms({ user }: { user: { name: string | null; email: string | null; image: string | null } }) {
  const router = useRouter();
  const { update } = useSession();
  const avatar = useAvatarUpload();

  const [profileState, profileAction, profilePending] = useActionState<FormState, FormData>(
    async (_previous, formData) => {
      const result = await updateProfileAction(formData);
      if (result.success) {
        await update();
        router.refresh();
      }
      return result;
    },
    null
  );

  const [passwordState, passwordAction, passwordPending] = useActionState<FormState, FormData>(
    (_previous, formData) => changePasswordAction(formData),
    null
  );

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <h2 className={titleClass}>Photo de profil</h2>
        <div className="flex items-center gap-5">
          <UserAvatar image={user.image} name={user.name} className="w-20 h-20 text-3xl" />
          <div className="flex flex-wrap gap-2">
            <label className={`${buttonClass} ${avatar.loading ? "opacity-50 pointer-events-none" : ""}`}>
              {avatar.loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Changer
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={avatar.loading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) avatar.upload(file);
                }}
              />
            </label>
            {user.image && (
              <button
                onClick={avatar.remove}
                disabled={avatar.loading}
                className="inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            )}
          </div>
        </div>
        {avatar.error && <p role="alert" className="text-xs font-bold text-red-400">{avatar.error}</p>}
      </section>

      <form action={profileAction} className={cardClass}>
        <h2 className={titleClass}>Profil</h2>
        <div>
          <label htmlFor="name" className={labelClass}>Pseudo</label>
          <input id="name" name="name" defaultValue={user.name ?? ""} required maxLength={40} className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" value={user.email ?? ""} disabled className={`${inputClass} opacity-50`} />
        </div>
        <Feedback state={profileState} successText="Profil mis à jour" />
        <button type="submit" disabled={profilePending} className={buttonClass}>
          {profilePending && <Loader2 size={14} className="animate-spin" />}
          Enregistrer
        </button>
      </form>

      <form action={passwordAction} className={cardClass}>
        <h2 className={titleClass}>Mot de passe</h2>
        <div>
          <label htmlFor="current" className={labelClass}>Mot de passe actuel</label>
          <input id="current" name="current" type="password" required autoComplete="current-password" className={inputClass} />
        </div>
        <div>
          <label htmlFor="next" className={labelClass}>Nouveau mot de passe</label>
          <input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
        </div>
        <Feedback state={passwordState} successText="Mot de passe modifié" />
        <button type="submit" disabled={passwordPending} className={buttonClass}>
          {passwordPending && <Loader2 size={14} className="animate-spin" />}
          Changer le mot de passe
        </button>
      </form>
    </div>
  );
}
