/**
 * Supabase Storage helpers
 *
 * All image uploads go through these utilities so URLs are always
 * properly formed and consistent across the app.
 *
 * Bucket structure (create these in Supabase Dashboard → Storage):
 *   public/logos       — logo.png, favicon, og images
 *   public/webinars    — hero images, speaker photos
 *   public/algos       — algorithm card images
 *   public/blog        — featured post images
 *   public/reviews     — company logos / avatars
 *   public/university  — course thumbnails
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Build a fully-qualified public Supabase Storage URL.
 *
 * @param bucket  Name of the storage bucket (e.g. "webinars")
 * @param path    Path inside the bucket (e.g. "hero/my-image.jpg")
 * @returns       Public URL string, or null if env is not configured
 *
 * @example
 *   storageUrl("webinars", "hero/summit-2026.jpg")
 *   // https://xxx.supabase.co/storage/v1/object/public/webinars/hero/summit-2026.jpg
 */
export function storageUrl(bucket: string, path: string): string | null {
  if (!SUPABASE_URL) return null;
  const base = SUPABASE_URL.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Returns a transformed Supabase Storage image URL with resize params.
 * Useful for thumbnails and responsive images.
 *
 * @param bucket  Storage bucket name
 * @param path    Path inside bucket
 * @param opts    Transformation options
 */
export function storageImageUrl(
  bucket: string,
  path: string,
  opts?: { width?: number; height?: number; quality?: number; format?: "webp" | "avif" | "origin" },
): string | null {
  const base = storageUrl(bucket, path);
  if (!base) return null;

  const params = new URLSearchParams();
  if (opts?.width) params.set("width", String(opts.width));
  if (opts?.height) params.set("height", String(opts.height));
  if (opts?.quality) params.set("quality", String(opts.quality));
  if (opts?.format) params.set("format", opts.format);

  const query = params.toString();
  if (!query) return base;
  // Supabase image transforms use the render endpoint
  return base.replace("/object/public/", "/render/image/public/") + "?" + query;
}

/**
 * Logo URL — always pulled from Supabase storage bucket "logos"
 * so you can update the logo without redeploying.
 *
 * Falls back to the local /logo.png if Supabase isn't configured.
 */
export function getLogoUrl(opts?: { width?: number; height?: number }): string {
  const url = storageImageUrl("logos", "logo.png", {
    width: opts?.width ?? 80,
    height: opts?.height ?? 80,
    format: "webp",
    quality: 90,
  });
  return url ?? "/logo.png";
}

/**
 * Upload a file to Supabase Storage (client-side only).
 * Returns the public URL of the uploaded file, or throws on error.
 *
 * @example (in an admin form)
 *   const url = await uploadToStorage(supabase, "webinars", "hero/my-image.jpg", file);
 */
export async function uploadToStorage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean; contentType?: string },
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: options?.upsert ?? true,
    contentType: options?.contentType ?? file.type,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const url = storageUrl(bucket, path);
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  return url;
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFromStorage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  bucket: string,
  path: string,
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}
