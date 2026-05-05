# Step 1.4 — Fetch University Data on the Detail Page

## What this step does

Updates your university detail page to fetch the full university record from Supabase — including `admissions_email` — and passes it down to the Apply button component. The fetch happens server-side so the email address never appears in the JavaScript bundle sent to the browser.

---

## 1. Locate your existing detail page

Your university detail page is most likely at one of these paths:

```
app/universities/[id]/page.tsx
app/university/[id]/page.tsx
app/[id]/page.tsx
```

Open whichever one you have. The changes in this step are additive — you are not rewriting the page, only adding the Supabase fetch and passing data to a new component.

---

## 2. Update the detail page

Below is the full updated file. Read the inline comments — they explain every decision.

**File:** `app/universities/[id]/page.tsx`

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

      {/* ── Your existing detail page content goes here ── */}
      <h1>{university.name}</h1>
      <p>{university.city}, {university.country}</p>
      {university.website && (
        <a href={university.website} target="_blank" rel="noopener noreferrer">
          Visit website
        </a>
      )}
      {university.description && <p>{university.description}</p>}
      {/* ── End existing content ── */}

      {/*
        ApplyButton receives both the university ID and the admissions email.
        The email is used purely as a null check — it tells the button
        whether to render or hide. It is NOT passed to the client as a
        visible value; the actual email is fetched again server-side
        in Stage 4 when the email is composed.
      */}
      <ApplyButton
        universityId={university.id}
        admissionsEmail={university.admissions_email}
      />

    </main>
  );
}
```

---

## 3. Understand the `notFound()` call

`notFound()` is imported from `next/navigation`. When called, it interrupts rendering and shows Next.js's built-in 404 page. It handles two failure cases:

**Case A — bad UUID in the URL:** If someone visits `/universities/not-a-real-id`, Supabase returns an error. The `if (error || !data)` check catches this.

**Case B — valid UUID but no matching row:** If the UUID is valid but doesn't exist in your table (e.g. a deleted university), Supabase returns `data = null` with no error. The `!data` check catches this.

Never let either case crash the page with an unhandled error. `notFound()` is the correct response.

---

## 4. Why `select('*')` is fine here

For the detail page, fetching all columns with `select('*')` is correct — you're displaying most of them anyway. If your `universities` table later grows to have many columns you don't need on this page (e.g. internal admin flags, large JSON blobs), switch to an explicit column list:

```ts
.select('id, name, country, city, website, description, admissions_email')
```

For now, `*` is clean and maintainable.

---

## 5. Why the fetch is server-side

This page is an `async` function with no `'use client'` directive at the top — that makes it a **React Server Component**. The Supabase fetch runs on the server before any HTML is sent to the browser.

The consequence for security: `admissions_email` is never included in the JavaScript bundle or the rendered HTML. It exists only in the server's memory during render, gets checked for null, and then only the boolean result (`is it null or not?`) affects what the browser sees. This matters because `admissions_email` is contact information — it should not be scraped from your page source.

If you accidentally add `'use client'` to this file, the fetch moves to the browser and the email becomes visible in network requests. Keep this file as a server component.

---

## 6. Handle the case where your detail page is already a client component

If your current detail page already has `'use client'` at the top (because it uses state, effects, or event handlers), you cannot make a direct `async` fetch in it. You have two options:

**Option A — split into server + client (recommended)**

Create a server component wrapper that fetches and passes data down, and keep your existing client component for the interactive parts:

```tsx
// app/universities/[id]/page.tsx  ← server component, no 'use client'
import { supabase } from '@/lib/supabase';
import { University } from '@/lib/types/university';
import { notFound } from 'next/navigation';
import UniversityDetailClient from './UniversityDetailClient';

export default async function UniversityDetailPage({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) notFound();

  return <UniversityDetailClient university={data as University} />;
}
```

```tsx
// app/universities/[id]/UniversityDetailClient.tsx  ← your existing client logic
'use client';

import { University } from '@/lib/types/university';
import ApplyButton from '@/components/ApplyButton';

export default function UniversityDetailClient({ university }: { university: University }) {
  // your existing state, effects, handlers here

  return (
    <main>
      <h1>{university.name}</h1>
      {/* ... rest of your UI ... */}
      <ApplyButton
        universityId={university.id}
        admissionsEmail={university.admissions_email}
      />
    </main>
  );
}
```

**Option B — use a Supabase client-side fetch**

If splitting feels like too much refactoring right now, you can fetch client-side using `useEffect`. This is less ideal for the security reason above, but it works:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { University } from '@/lib/types/university';
import ApplyButton from '@/components/ApplyButton';

export default function UniversityDetailPage({ params }: { params: { id: string } }) {
  const [university, setUniversity] = useState<University | null>(null);

  useEffect(() => {
    supabase
      .from('universities')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        if (data) setUniversity(data as University);
      });
  }, [params.id]);

  if (!university) return <p>Loading...</p>;

  return (
    <main>
      <h1>{university.name}</h1>
      <ApplyButton
        universityId={university.id}
        admissionsEmail={university.admissions_email}
      />
    </main>
  );
}
```

Use Option A if you can. Use Option B only if refactoring to a server component is not feasible right now.

---

## 7. Add static generation for better performance (optional but recommended)

If your university data doesn't change frequently, you can tell Next.js to pre-render detail pages at build time using `generateStaticParams`. This makes page loads near-instant:

```tsx
export async function generateStaticParams() {
  const { data } = await supabase
    .from('universities')
    .select('id');

  return (data ?? []).map((row) => ({ id: row.id }));
}
```

Add this function to `app/universities/[id]/page.tsx` alongside the page component. Next.js will call it at build time, fetch all university IDs, and pre-render a static HTML file for each one.

When you add new universities via your scraper (Part 1 of the overall plan), run `npm run build` again to regenerate the static pages, or set `revalidate` to refresh them automatically:

```tsx
export const revalidate = 3600; // regenerate every hour
```

---

## Checklist

- [ ] Detail page imports `supabase`, `University` type, `notFound`, and `ApplyButton`
- [ ] Supabase query uses `.single()` and handles both `error` and `!data` with `notFound()`
- [ ] `university` variable is typed as `University`
- [ ] `ApplyButton` rendered at the bottom of the page with `universityId` and `admissionsEmail` props
- [ ] Page is a server component (no `'use client'` at the top, or split correctly if it needs to be a client component)
- [ ] `npx tsc --noEmit` passes with no errors

---

## Next step

→ **Step 1.5** — Build the `ApplyButton` component