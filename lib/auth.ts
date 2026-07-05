import { supabase } from "./supabase";

type SupabaseLikeError = {
  message?: string;
};

type AuthErrorMessages = {
  invalidCredentials: string;
  emailNotConfirmed: string;
  accountExists: string;
  authUnavailable: string;
  fallback: string;
};

export async function ensureProfileRecord(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function getAuthErrorMessage(error: SupabaseLikeError | null | undefined, messages: AuthErrorMessages) {
  const rawMessage = error?.message?.trim() || "";
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return messages.invalidCredentials;
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return messages.emailNotConfirmed;
  }

  if (normalizedMessage.includes("user already registered")) {
    return messages.accountExists;
  }

  if (
    normalizedMessage.includes("signup disabled") ||
    normalizedMessage.includes("signups disabled") ||
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("timeout")
  ) {
    return messages.authUnavailable;
  }

  return rawMessage || messages.fallback;
}