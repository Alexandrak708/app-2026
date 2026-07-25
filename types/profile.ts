/** A row from the `profiles` table. */
export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  /** Stored as a stable region key (see constants/regions.ts), e.g. "bulgaria". */
  region: string | null;
};
