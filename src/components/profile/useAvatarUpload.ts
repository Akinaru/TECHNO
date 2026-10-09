"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateAvatarAction, removeAvatarAction } from "@/app/actions/user";
import { resizeImageToSquare } from "@/lib/resizeImage";

export function useAvatarUpload() {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<{ success: boolean; error?: string }>) {
    setLoading(true);
    setError(null);
    try {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Erreur lors de l'upload");
        return;
      }
      // Refresh the JWT so the navbar avatar follows, then the server components
      await update();
      router.refresh();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    upload: (file: File) =>
      run(async () => {
        const resized = await resizeImageToSquare(file);
        const formData = new FormData();
        formData.append("image", resized);
        return updateAvatarAction(formData);
      }),
    remove: () => run(removeAvatarAction),
  };
}
