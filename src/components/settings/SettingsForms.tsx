"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAvatarUpload } from "@/components/profile/useAvatarUpload";
import { updateProfileAction, changePasswordAction } from "@/app/actions/user";

type FormState = { success: boolean; error?: string } | null;

function Feedback({ state, successText }: { state: FormState; successText: string }) {
  if (!state) return null;
  return state.success ? (
    <p role="status">
      <span className="stamp stamp--green text-sm" style={{ "--tilt": "-4deg" } as React.CSSProperties}>
        {successText}
      </span>
    </p>
  ) : (
    <p role="alert" className="help is-error">{state.error}</p>
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
    <div className="grid gap-8">
      <section className="shape paper card on-paper tilt grid gap-5" style={{ "--tilt": "-0.8deg" } as React.CSSProperties}>
        <h2 className="display t-h2">Photo de profil</h2>
        <div className="flex flex-wrap items-center gap-5">
          <UserAvatar image={user.image} name={user.name} className="w-20 h-20 text-3xl" />
          <div className="flex flex-wrap gap-3">
            <label
              className={`btn btn--dark btn--sm${avatar.loading ? " is-loading opacity-50 pointer-events-none" : ""}`}
            >
              <span>
                {avatar.loading ? (
                  <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
                ) : (
                  <Upload size={16} strokeWidth={2.5} />
                )}
                Changer
              </span>
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
              <button onClick={avatar.remove} disabled={avatar.loading} className="btn btn--danger btn--sm">
                <span>
                  <Trash2 size={16} strokeWidth={2.5} /> Supprimer
                </span>
              </button>
            )}
          </div>
        </div>
        {avatar.error && <p role="alert" className="help is-error">{avatar.error}</p>}
      </section>

      <form action={profileAction} className="shape paper card on-paper tilt grid gap-5" style={{ "--tilt": "0.8deg" } as React.CSSProperties}>
        <h2 className="display t-h2">Profil</h2>
        <div className="field">
          <label htmlFor="name" className="label ink-muted">Pseudo</label>
          <input id="name" name="name" defaultValue={user.name ?? ""} required maxLength={40} className="input" />
        </div>
        <div className="field">
          <label htmlFor="email" className="label ink-muted">Email</label>
          <input id="email" value={user.email ?? ""} disabled className="input opacity-60 cursor-not-allowed" />
          <span className="help">L&apos;email ne se change pas.</span>
        </div>
        <Feedback state={profileState} successText="Profil mis à jour" />
        <div>
          <button type="submit" disabled={profilePending} className={`btn${profilePending ? " is-loading" : ""}`}>
            <span>
              {profilePending && <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />}
              Enregistrer ▸
            </span>
          </button>
        </div>
      </form>

      <form action={passwordAction} className="shape paper card on-paper tilt grid gap-5" style={{ "--tilt": "-0.6deg" } as React.CSSProperties}>
        <h2 className="display t-h2">Mot de passe</h2>
        <div className="field">
          <label htmlFor="current" className="label ink-muted">Mot de passe actuel</label>
          <input id="current" name="current" type="password" required autoComplete="current-password" className="input" />
        </div>
        <div className="field">
          <label htmlFor="next" className="label ink-muted">Nouveau mot de passe</label>
          <input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" className="input" />
          <span className="help">8 caractères minimum.</span>
        </div>
        <Feedback state={passwordState} successText="Mot de passe modifié" />
        <div>
          <button type="submit" disabled={passwordPending} className={`btn btn--dark${passwordPending ? " is-loading" : ""}`}>
            <span>
              {passwordPending && <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />}
              Changer le mot de passe
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
