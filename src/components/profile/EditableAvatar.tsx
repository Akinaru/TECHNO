"use client";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { Upload, Loader2 } from "lucide-react";
import { useAvatarUpload } from "@/components/profile/useAvatarUpload";

interface EditableAvatarProps {
  image: string | null;
  name: string | null;
  isOwnProfile: boolean;
}

export function EditableAvatar({ image, name, isOwnProfile }: EditableAvatarProps) {
  const { upload, loading, error } = useAvatarUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) upload(file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group -rotate-3">
        <UserAvatar
          image={image}
          name={name}
          className="w-24 h-24 sm:w-32 sm:h-32 text-5xl sm:text-6xl border-[0.22rem] shadow-[var(--shadow-lg)]"
        />

        {isOwnProfile && (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-100 bg-ink/75 text-white">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin" strokeWidth={2.5} />
            ) : (
              <>
                <Upload className="w-8 h-8 mb-1" strokeWidth={2.5} />
                <span className="display text-sm">Changer</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              disabled={loading}
              aria-label="Changer la photo de profil"
            />
          </label>
        )}
      </div>
      {error && <p className="t-small font-bold text-danger max-w-[12rem] text-center" role="alert">{error}</p>}
    </div>
  );
}
