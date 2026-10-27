import { getOption, setOption } from "@/lib/options";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export default async function AdminConfigPage() {
  await requireAdmin();
  const spotifyClientId = await getOption("spotify_client_id") || "";
  const spotifyClientSecret = await getOption("spotify_client_secret") || "";

  async function updateConfig(formData: FormData) {
    "use server";
    await requireAdmin();
    const clientId = formData.get("clientId") as string;
    const clientSecret = formData.get("clientSecret") as string;

    await setOption("spotify_client_id", clientId);
    await setOption("spotify_client_secret", clientSecret);
    
    revalidatePath("/admin/config");
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
      <div className="mb-10">
        <span className="tag">Zone admin</span>
        <h1 className="display outlined t-h1 a-drop mt-2" style={{ "--tilt": "-1deg" } as React.CSSProperties}>
          Configuration
        </h1>
      </div>

      <form
        action={updateConfig}
        className="shape paper card on-paper tilt grid gap-5"
        style={{ "--tilt": "0.8deg" } as React.CSSProperties}
      >
        <h2 className="display t-h2">Spotify</h2>
        <label className="field">
          <span className="label ink-muted">Spotify Client ID</span>
          <input name="clientId" type="text" defaultValue={spotifyClientId} className="input" />
        </label>

        <label className="field">
          <span className="label ink-muted">Spotify Client Secret</span>
          <input name="clientSecret" type="password" defaultValue={spotifyClientSecret} className="input" />
        </label>

        <div>
          <button type="submit" className="btn">
            <span>Sauvegarder la config ▸</span>
          </button>
        </div>
      </form>
    </div>
  );
}
