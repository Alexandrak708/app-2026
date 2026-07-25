import { supabase } from "./supabase";

const AVATAR_BUCKET = "avatars";

/** The editable, free-text detail columns on a profile row. */
export type ProfileDetails = {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  region: string | null;
};

/** Update the display name on a user's profile row. */
export async function updateProfileFullName(userId: string, fullName: string): Promise<void> {
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);

  if (error) {
    throw error;
  }
}

/** Persist any subset of a user's editable profile detail fields. */
export async function updateProfileDetails(
  userId: string,
  details: Partial<ProfileDetails>
): Promise<void> {
  const { error } = await supabase.from("profiles").update(details).eq("id", userId);

  if (error) {
    throw error;
  }
}

/** Persist a new avatar URL on a user's profile row. */
export async function updateProfileAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Upload avatar bytes to storage and return a cache-busted public URL.
 * The caller is responsible for reading the picked image into bytes
 * (platform-specific) and for persisting the returned URL via
 * `updateProfileAvatarUrl`.
 */
export async function uploadAvatar(
  userId: string,
  bytes: Uint8Array,
  contentType: string,
  fileExt: string
): Promise<string> {
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, bytes, { upsert: true, contentType });

  if (uploadError) {
    throw uploadError;
  }

  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  return `${urlData.publicUrl}?t=${Date.now()}`;
}
