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
    normalizedMessage.includes("timeout") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("too many requests")
  ) {
    return messages.authUnavailable;
  }

  // Never surface raw, untranslated Supabase strings to the user.
  return messages.fallback;
}

type ParsedAuthLink = {
  params: Record<string, string>;
  type: string | null;
};

// Pulls auth params out of a deep link, checking both the query string
// (?a=b) and the fragment (#a=b) since Supabase uses the fragment by default.
function parseAuthLink(url: string): ParsedAuthLink {
  const params: Record<string, string> = {};

  const collect = (segment: string) => {
    segment.split("&").forEach((pair) => {
      if (!pair) return;
      const [key, value] = pair.split("=");
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
      }
    });
  };

  const queryIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");

  if (queryIndex !== -1) {
    const end = hashIndex > queryIndex ? hashIndex : url.length;
    collect(url.slice(queryIndex + 1, end));
  }
  if (hashIndex !== -1) {
    collect(url.slice(hashIndex + 1));
  }

  return { params, type: params.type ?? null };
}

export type AuthLinkResult = {
  type: string | null;
  recovery: boolean;
};

// Turns an incoming confirmation / recovery deep link into an active session.
// Returns null when the URL carries no auth tokens (a normal app link).
export async function createSessionFromUrl(url: string): Promise<AuthLinkResult | null> {
  const { params, type } = parseAuthLink(url);

  if (params.error || params.error_description) {
    throw new Error(params.error_description || params.error);
  }

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (!accessToken || !refreshToken) {
    return null;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return { type, recovery: type === "recovery" };
}
