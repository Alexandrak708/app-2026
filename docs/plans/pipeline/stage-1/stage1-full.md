# Stage 1 — Trigger: Detailed Execution Plan

## What this stage does

When a student lands on a university detail page, the app checks whether that university has an admissions email stored in Supabase. If it does, an **Apply Now** button is rendered. Clicking it routes the student to `/apply/[universityId]` — the entry point for the rest of the pipeline. If no email exists, the button is hidden entirely and a fallback message is shown instead.

This stage has zero AI involvement. It is purely a database read, a conditional render, and a client-side navigation.

---

## Prerequisites before you start

Before writing a single line of code for this stage, confirm the following are already in place:

- [ ] Supabase project created and running
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to `.env.local`
- [ ] `@supabase/supabase-js` installed: `npm install @supabase/supabase-js`
- [ ] A shared Supabase client exists at `lib/supabase.ts` (see below — create it now if missing)
- [ ] The `universities` table exists in Supabase with at minimum: `id`, `name`, `admissions_email`

---

## Step 1.1 — Create the shared Supabase client

**File:** `lib/supabase.ts`

This file is imported everywhere in the app that needs to talk to Supabase. Create it once here; never instantiate the Supabase client in individual components or routes.

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Why this matters:** Instantiating the client in multiple places creates duplicate connections and makes key rotation a multi-file operation. One file, one client, import everywhere.

**Verify it works:**

```ts
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.from('universities').select('id').limit(1);
console.log(data, error);
```

Run this in a test API route and confirm you get a row back with no error before proceeding.

---

## Step 1.2 — Confirm and update the Supabase `universities` table schema

Go to your Supabase dashboard → Table Editor → `universities`.

Confirm these columns exist. Add any that are missing:

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | No | Primary key, default `gen_random_uuid()` |
| `name` | `text` | No | Full university name |
| `admissions_email` | `text` | Yes | Must be nullable — many universities won't have one yet |
| `country` | `text` | Yes | |
| `city` | `text` | Yes | |
| `website` | `text` | Yes | |

**To add `admissions_email` if it doesn't exist yet**, run this in the Supabase SQL editor:

```sql
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS admissions_email text;
```

**Populate it for your existing universities** either directly in the Table Editor UI or via SQL:

```sql
UPDATE universities
SET admissions_email = 'admissions@example-uni.edu'
WHERE name = 'Example University';
```

Do this for every university currently in your database that you know the admissions email for. Universities with `admissions_email = NULL` will not show the Apply button — that is intentional.

---

## Step 1.3 — Define the University TypeScript type

**File:** `lib/types/university.ts`  
(Create the `lib/types/` folder if it doesn't exist)

```ts
export type University = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  website: string | null;
  admissions_email: string | null;
  description: string | null;
  // add any other columns you have in your table
};
```

Import this type everywhere you work with university data. Keeping it in one place means when you add a column to Supabase, you update the type in one file and TypeScript catches everywhere that needs updating.

---

## Step 1.4 — Fetch the university data on the detail page

**File:** `app/universities/[id]/page.tsx`  
(Adjust the path if your detail page lives elsewhere)

The detail page needs to fetch the full university record including `admissions_email`. Do this as a **server component fetch** — never fetch it client-side from the browser, because that exposes your query logic and adds unnecessary latency.

```tsx
import { supabase } from '@/lib/supabase';
import { University } from '@/lib/types/university';
import { notFound } from 'next/navigation';
import ApplyButton from '@/components/ApplyButton';

type Props = {
  params: { id: string };
};

export default async function UniversityDetailPage({ params }: Props) {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const university = data as University;

  return (
    <main>
      <h1>{university.name}</h1>
      <p>{university.city}, {university.country}</p>

      {/* ... rest of your existing detail page content ... */}

      <ApplyButton
        universityId={university.id}
        admissionsEmail={university.admissions_email}
      />
    </main>
  );
}
```

**Important:** The `notFound()` call from `next/navigation` renders Next.js's built-in 404 page if the university ID doesn't exist in the database. Always handle this — never let a missing record crash the page.

---

## Step 1.5 — Build the `ApplyButton` component

**File:** `components/ApplyButton.tsx`

This component has one job: render the correct UI based on whether `admissionsEmail` is present or null. It is a **client component** because it uses `useRouter` for navigation.

```tsx
'use client';

import { useRouter } from 'next/navigation';

type Props = {
  universityId: string;
  admissionsEmail: string | null;
};

export default function ApplyButton({ universityId, admissionsEmail }: Props) {
  const router = useRouter();

  if (!admissionsEmail) {
    return (
      <p style={{ color: 'gray', fontSize: '0.875rem' }}>
        Application contact not available for this university.
      </p>
    );
  }

  const handleApply = () => {
    router.push(`/apply/${universityId}`);
  };

  return (
    <button
      onClick={handleApply}
      style={{
        backgroundColor: '#1F4E8C',
        color: 'white',
        padding: '12px 28px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: 500,
        cursor: 'pointer',
        width: '100%',
        marginTop: '24px',
      }}
    >
      Apply Now
    </button>
  );
}
```

**Styling note:** The inline styles above are a baseline. Replace with your app's existing CSS classes, Tailwind utility classes, or component library equivalents — whatever your project already uses for buttons. The logic is what matters here; the styling is scaffolding.

**Why a separate component and not inline JSX?** The detail page is a server component. Anything that uses hooks (`useRouter`, `useState`, `onClick`) must be a client component marked with `'use client'`. Splitting the button out keeps the server component clean and avoids making the entire detail page a client component unnecessarily.

---

## Step 1.6 — Create the apply route placeholder

**File:** `app/apply/[universityId]/page.tsx`

You need this file to exist now so that `router.push('/apply/[universityId]')` doesn't 404 when the button is clicked. It doesn't need to be fully built yet — create a stub that confirms the routing works end-to-end.

```tsx
type Props = {
  params: { universityId: string };
};

export default function ApplyPage({ params }: Props) {
  return (
    <main>
      <h1>Application page</h1>
      <p>University ID: {params.universityId}</p>
      <p>Stage 2 coming soon.</p>
    </main>
  );
}
```

This stub lets you test the full Stage 1 flow — button click → navigation → landing on the apply page — before building Stages 2 through 5.

---

## Step 1.7 — Add Row Level Security to the `universities` table

This is a security step that is easy to skip and painful to add later. Do it now while you're in Supabase.

In the Supabase dashboard → Authentication → Policies → `universities` table:

Enable RLS on the table:

```sql
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
```

Add a read policy so the app's anon key can read university records:

```sql
CREATE POLICY "Anyone can read universities"
ON universities
FOR SELECT
USING (true);
```

Add a write policy so only authenticated users with the service role can insert or update (protects your data from public writes):

```sql
CREATE POLICY "Only service role can write"
ON universities
FOR ALL
USING (auth.role() = 'service_role');
```

**Why now?** Once you deploy and your Supabase project is publicly accessible, without RLS anyone who knows your anon key can modify your universities table directly. The anon key is exposed in the browser via `NEXT_PUBLIC_` env vars — that's unavoidable and fine, as long as RLS is on.

---

## Step 1.8 — End-to-end test checklist

Work through these manually before moving on to Stage 2. Every item must pass.

**Happy path — university has an admissions email:**
- [ ] Navigate to a university detail page where `admissions_email` is set in Supabase
- [ ] Confirm the **Apply Now** button is visible, styled correctly, and full-width
- [ ] Click the button — confirm it navigates to `/apply/[universityId]` with the correct UUID in the URL
- [ ] Confirm the stub apply page renders and shows the correct university ID

**Guard path — university has no admissions email:**
- [ ] Set `admissions_email = NULL` for one university directly in Supabase Table Editor
- [ ] Navigate to that university's detail page
- [ ] Confirm the Apply Now button is **not visible**
- [ ] Confirm the "Application contact not available" text is visible instead

**Edge cases:**
- [ ] Navigate to `/universities/fake-id-that-does-not-exist` — confirm the 404 page renders (not a crash)
- [ ] Open browser DevTools → Network tab → confirm only one Supabase request is made on page load (no duplicate fetches)
- [ ] Confirm `admissions_email` is **not** visible in the page source or JavaScript bundle (it's fetched server-side, so it should not appear in the HTML sent to the browser)

---

## What Stage 1 does NOT do

To keep scope clear — the following are explicitly out of scope for this stage and handled later:

- No authentication check — any visitor can click Apply Now
- No tracking of who clicked the button
- No validation of the `admissions_email` format (that happens at compose time in Stage 4)
- No loading state on the button click — `router.push` is instant
- No analytics event on button click (add this later once the pipeline is proven)

---

## Files created in this stage

| File | Purpose |
|---|---|
| `lib/supabase.ts` | Shared Supabase client |
| `lib/types/university.ts` | TypeScript type for university records |
| `app/universities/[id]/page.tsx` | Updated detail page that passes `admissions_email` to button |
| `components/ApplyButton.tsx` | Conditional Apply Now button component |
| `app/apply/[universityId]/page.tsx` | Stub apply page (to be built in Stages 2–5) |

## Environment variables required

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → anon public key |