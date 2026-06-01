import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadToSupabase(
  file: File | Buffer,
  bucket: string,
  path: string,
  contentType?: string,
): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: contentType || (file instanceof File ? file.type : "application/octet-stream"),
    upsert: true,
  })

  if (error) {
    console.error("Error uploading to Supabase:", error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Obtener URL pública
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return publicData.publicUrl
}

export async function deleteFromSupabase(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    console.error("Error deleting from Supabase:", error)
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export function getSupabaseUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}
