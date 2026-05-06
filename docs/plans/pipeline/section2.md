# Section 2 — The Seed Process

## Where you are now

You have universities in the database but nothing in `application_requirements` yet. You have no web scraping tool installed and you will be using Gemini 2.5 Flash instead of Claude for AI calls. This section gets the seed process running so every university in your database ends up with a list of required documents extracted automatically from their admissions page.

---

## What needs to be done

### 1. Install Playwright

Playwright is the tool that visits university websites on your behalf — it runs a real browser in the background so it can load pages that use JavaScript, handle redirects, and read the actual visible text a student would see.

Run these two commands in your project root:

```bash
npm install playwright
npx playwright install chromium
```

The first installs the Playwright library. The second downloads the Chromium browser that Playwright controls. The download is about 150MB — let it finish completely before moving on.

Verify it worked by running:

```bash
npx playwright --version
```

You should see a version number printed. If you see an error, re-run the install commands.

---

### 2. Set up Gemini 2.5 Flash

Go to `https://aistudio.google.com/app/apikey` and generate a free API key. Copy it.

Add it to your `.env.local` file:

```
GEMINI_API_KEY=your-key-here
```

Install the Google Generative AI SDK:

```bash
npm install @google/generative-ai
```

Create a shared Gemini client file so every part of the project that needs AI imports from one place:

**File: `lib/gemini.ts`**

```ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const gemini = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

Verify it works by adding a quick test in any API route or script:

```ts
import { gemini } from '@/lib/gemini';
const result = await gemini.generateContent('Say hello in one word.');
console.log(result.response.text());
```

You should see a single word response. If you get an API key error, double-check that `.env.local` has the key and that you restarted your dev server after adding it.

---

### 3. Create the page fetching utility

This utility opens a browser, visits a URL, strips away navigation and cookie banners, and returns only the readable body text. This is what gets sent to Gemini for extraction.

**File: `lib/fetchPage.ts`**

```ts
import { chromium } from 'playwright';

export async function fetchPage(url: string): Promise<string | null> {
  let browser = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 12000,
    });

    const text = await page.evaluate(() => {
      // Remove elements that are noise — nav, footer, scripts, cookie banners
      document.querySelectorAll(
        'nav, footer, header, script, style, noscript, iframe, .cookie-banner, #cookie-notice, [class*="cookie"], [id*="cookie"]'
      ).forEach(el => el.remove());

      return document.body?.innerText ?? '';
    });

    // Cap at 6000 characters — enough for Gemini to find requirements
    // without wasting tokens on irrelevant page content
    return text.slice(0, 6000).trim();

  } catch (err) {
    console.error(`fetchPage failed for ${url}:`, err);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}
```

---

### 4. Create the Supabase admin client

The seed script writes to the database. Your public anon key is read-only due to RLS. You need a separate client that uses the service role key, which bypasses RLS for server-side operations.

**File: `lib/supabase-admin.ts`**

```ts
import { createClient } from '@supabase/supabase-js';

// Never import this in any client component or page.
// The service role key bypasses RLS — server-side scripts only.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

Add the service role key to `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Find it in Supabase dashboard → Project Settings → API → `service_role` key. Do not prefix this with `NEXT_PUBLIC_` — that would expose it to the browser.

---

### 5. Create the seed script

This script loops through every university in the database, visits their admissions page, extracts the required documents using Gemini, and writes the results to `application_requirements`. It skips universities that already have requirements stored.

**File: `scripts/seedRequirements.ts`**

```ts
import { supabaseAdmin } from '../lib/supabase-admin';
import { fetchPage } from '../lib/fetchPage';
import { gemini } from '../lib/gemini';

async function extractRequirements(pageText: string, universityName: string) {
  const prompt = `
You are extracting university application requirements from a web page.
University: ${universityName}
Page content:
${pageText}

Extract all documents a student must submit to apply.
Return ONLY a JSON array. No explanation, no markdown, no code fences.
Each item must have exactly these fields:
- label: string (name of the document, e.g. "Official Transcript")
- required: boolean (true if mandatory, false if optional)
- format: string or null (e.g. "PDF", "Word", null if not specified)
- notes: string or null (any specific instructions, e.g. "Certified copy, sealed by institution")

If you cannot find any requirements, return an empty array: []
`;

  try {
    const result = await gemini.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch (err) {
    console.error(`Gemini extraction failed for ${universityName}:`, err);
    return null;
  }
}

async function seed() {
  const { data: universities, error } = await supabaseAdmin
    .from('universities')
    .select('id, name, website');

  if (error || !universities) {
    console.error('Could not fetch universities:', error?.message);
    process.exit(1);
  }

  console.log(`\nFound ${universities.length} universities\n`);

  let written = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < universities.length; i++) {
    const uni = universities[i];
    console.log(`[${i + 1}/${universities.length}] ${uni.name}`);

    // Skip if requirements already exist
    const { data: existing } = await supabaseAdmin
      .from('application_requirements')
      .select('id')
      .eq('university_id', uni.id)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('  → Already has requirements, skipping\n');
      skipped++;
      continue;
    }

    if (!uni.website) {
      console.log('  → No website URL, skipping\n');
      skipped++;
      continue;
    }

    // Try admissions subpage first, fall back to homepage
    const admissionsUrl = uni.website.replace(/\/?$/, '/admissions');
    let pageText = await fetchPage(admissionsUrl);

    if (!pageText || pageText.length < 200) {
      console.log('  → Admissions subpage failed, trying homepage');
      pageText = await fetchPage(uni.website);
    }

    if (!pageText || pageText.length < 200) {
      console.log('  → Could not fetch page content, skipping\n');
      failed++;
      continue;
    }

    const requirements = await extractRequirements(pageText, uni.name);

    if (!requirements || requirements.length === 0) {
      console.log('  → No requirements found\n');
      failed++;
      continue;
    }

    const rows = requirements.map((r: any) => ({
      university_id: uni.id,
      label: String(r.label),
      required: Boolean(r.required),
      format: r.format ?? null,
      notes: r.notes ?? null,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('application_requirements')
      .insert(rows);

    if (insertError) {
      console.error(`  → Insert failed: ${insertError.message}\n`);
      failed++;
    } else {
      console.log(`  → Wrote ${rows.length} requirements\n`);
      written += rows.length;
    }

    // Pause between universities to avoid hitting rate limits
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('─────────────────────────────');
  console.log(`Requirements written : ${written}`);
  console.log(`Universities skipped : ${skipped}`);
  console.log(`Universities failed  : ${failed}`);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

---

### 6. Run the seed script

Install `ts-node` if you don't have it:

```bash
npm install -D ts-node
```

Add a script entry to `package.json`:

```json
"scripts": {
  "seed:requirements": "ts-node --project tsconfig.json -e 'require(\"ts-node/register\")' scripts/seedRequirements.ts"
}
```

Run it:

```bash
npm run seed:requirements
```

Watch the console. Each university logs whether requirements were found, how many were written, or why it was skipped. For Technical University Varna, you should see something like "Wrote 5 requirements" after a few seconds.

---

### 7. Verify the results

After the script finishes, run this in the Supabase SQL Editor:

```sql
SELECT
  u.name,
  COUNT(r.id) AS requirements_count
FROM universities u
LEFT JOIN application_requirements r ON r.university_id = u.id
GROUP BY u.name
ORDER BY requirements_count DESC;
```

Universities with requirements will show counts of 3–8 typically. Universities showing `0` had unreachable pages and need requirements added manually — go into the Table Editor and add their requirements by hand, using the university's actual admissions page as a reference.

---

### 8. Add requirements manually for any that failed

For any university the script could not reach, insert their requirements directly in the SQL Editor:

```sql
INSERT INTO application_requirements (university_id, label, required, format, notes)
VALUES
  ('paste-university-uuid-here', 'Official Transcript', true, 'PDF', 'Certified copy'),
  ('paste-university-uuid-here', 'Passport Copy', true, 'PDF', 'Photo page only'),
  ('paste-university-uuid-here', 'Motivation Letter', true, 'PDF', 'Maximum 2 pages'),
  ('paste-university-uuid-here', 'English Language Certificate', false, 'PDF', 'IELTS or equivalent');
```

Get the university UUID from the `universities` table in the Table Editor.

---

## Technology used in this section

- **Playwright** — visits university websites using a real headless browser. Handles JavaScript-rendered pages and redirects that simple HTTP requests cannot.
- **Gemini 2.5 Flash** — reads the page text and extracts structured requirements from it. Free tier is sufficient for seeding a few dozen universities.
- **Supabase service role client** — writes the extracted requirements to the database, bypassing RLS which blocks the public anon key from writing.
- **ts-node** — runs the TypeScript seed script directly without a build step.

---

## You are done with this section when

- Playwright is installed and `npx playwright --version` prints a version number
- `lib/gemini.ts` exists and a test call returns a response
- `lib/fetchPage.ts` exists
- `lib/supabase-admin.ts` exists using the service role key
- The seed script ran and Technical University Varna has requirements in the database
- Every university either has requirements written or has them added manually
- The verification SQL query shows no university with `0` requirements