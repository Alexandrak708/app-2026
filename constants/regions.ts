/**
 * Account-region options. Stored on the profile as the stable `key`; the
 * label shown to the user is localized via `t('profile.regions.<key>')`.
 *
 * Extend this list as needed — add the key here and a matching entry under
 * `profile.regions` in every locale file.
 */
export const REGION_OPTIONS = [
  "bulgaria",
  "eu",
  "uk",
  "us",
  "other",
] as const;

export type RegionKey = (typeof REGION_OPTIONS)[number];

export function isRegionKey(value: string | null | undefined): value is RegionKey {
  return !!value && (REGION_OPTIONS as readonly string[]).includes(value);
}
