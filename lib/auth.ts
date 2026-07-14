import * as Linking from "expo-linking";

import { supabase } from "./supabase";

type EmailPasswordCredentials = {
  email: string;
  password: string;
};

type SupabaseLikeError = {
  message?: string;
};

/** Sign in with email + password. Returns Supabase's raw `{ data, error }`. */
export function signIn(credentials: EmailPasswordCredentials) {
  return supabase.auth.signInWithPassword(credentials);
}

/** Register a new account with email + password. */
export function signUp(credentials: EmailPasswordCredentials) {
  return supabase.auth.signUp(credentials);
}

/** Send a password-reset email that deep-links back into the app. */
export function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: Linking.createURL("/"),
  });
}

/** Set a new password for the currently authenticated (recovery) user. */
export function updatePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

/** Resolve the currently authenticated user, or null when signed out. */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/** Sign out on this device only (keeps other sessions active). */
export function signOutLocal() {
  return supabase.auth.signOut({ scope: "local" });
}

type AuthErrorMessages = {
  invalidCredentials?: string;
  accountExists?: string;
  authUnavailable?: string;
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

export function getAuthErrorMessage(error: SupabaseLikeError | null | undefined, messages: AuthErrorMessages): string {
  const rawMessage = error?.message?.trim() || "";
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return messages.invalidCredentials ?? messages.fallback;
  }

  if (normalizedMessage.includes("user already registered")) {
    return messages.accountExists ?? messages.fallback;
  }

  if (
    normalizedMessage.includes("signup disabled") ||
    normalizedMessage.includes("signups disabled") ||
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("timeout")
  ) {
    return messages.authUnavailable ?? messages.fallback;
  }

  return messages.fallback;
}

interface PasswordValidationResult {
  valid: boolean;
  warningKey?: string;
}

export function validatePassword(password: string, confirmPassword?: string): PasswordValidationResult {
  if (!password) {
    return { valid: false, warningKey: "warnRequiredFields" };
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { valid: false, warningKey: "warnPasswordMismatch" };
  }
  if (password.length < 8) {
    return { valid: false, warningKey: "warnPasswordLength" };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, warningKey: "warnPasswordWeak" };
  }
  return { valid: true };
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

type AuthLinkResult = {
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
