// Browser-only: crops an image to a centered square and re-encodes it as a small WebP.
// Phone photos of several MB become ~30-80 KB avatars before they ever leave the device.
export async function resizeImageToSquare(file: File, size = 512): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Ce fichier n'est pas une image");
  }

  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const target = Math.min(size, side);

  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");

  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    target,
    target
  );
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("Impossible de convertir l'image");

  // Safari without WebP encoding falls back to PNG, which the server also accepts
  const ext = blob.type === "image/webp" ? "webp" : "png";
  return new File([blob], `avatar.${ext}`, { type: blob.type });
}
