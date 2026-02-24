import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdminApi } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

function getFileExtension(file: File) {
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (nameExt && /^[a-z0-9]+$/.test(nameExt)) {
    return nameExt;
  }
  const fromMime = file.type.split("/")[1]?.toLowerCase();
  if (fromMime && /^[a-z0-9.+-]+$/.test(fromMime)) {
    return fromMime.replace("svg+xml", "svg");
  }
  return "bin";
}

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  const formData = await request.formData();
  const filePart = formData.get("file");
  const folderRaw = String(formData.get("folder") ?? "admin").trim();
  const bucketRaw = String(
    formData.get("bucket") ?? process.env.SUPABASE_STORAGE_BUCKET ?? "assets",
  ).trim();

  if (!(filePart instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  if (!filePart.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
  }

  if (filePart.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Image too large. Max size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB.` },
      { status: 400 },
    );
  }

  const folder = sanitizeSegment(folderRaw) || "admin";
  const bucket = sanitizeSegment(bucketRaw) || "assets";
  const extension = getFileExtension(filePart);
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const path = `${folder}/${fileName}`;

  const admin = createSupabaseAdminClient();
  const upload = await admin.storage
    .from(bucket)
    .upload(path, filePart, {
      contentType: filePart.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 400 });
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return NextResponse.json({
    bucket,
    path,
    url: data.publicUrl,
  });
}
