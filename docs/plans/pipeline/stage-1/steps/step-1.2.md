# Step 1.2 — Confirm and Update the Supabase `universities` Table Schema

## What this step does

Verifies that your `universities` table in Supabase has all the columns the pipeline depends on, and populates `admissions_email` for your existing university records. This is a pure database task — no code is written in this step.

---

## 1. Verify the table structure

Open your Supabase dashboard → **Table Editor** → `universities`.

Confirm every column in this list exists. For each one that is missing, run the corresponding SQL in the **SQL Editor** (Dashboard → SQL Editor → New query):

| Column | Type | Nullable | Add if missing |
|---|---|---|---|
| `id` | `uuid` | No | Already exists if you ran the migration |
| `name` | `text` | No | Already exists |
| `admissions_email` | `text` | Yes | See SQL below |
| `country` | `text` | Yes | See SQL below |
| `city` | `text` | Yes | See SQL below |
| `website` | `text` | Yes | See SQL below |
| `description` | `text` | Yes | See SQL below |
| `created_at` | `timestamptz` | No | Already exists |
| `updated_at` | `timestamptz` | No | Already exists |

**SQL to add any missing columns** — safe to run multiple times, `IF NOT EXISTS` prevents errors on columns that are already there:

```sql
ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS admissions_email  text,
  ADD COLUMN IF NOT EXISTS country           text,
  ADD COLUMN IF NOT EXISTS city              text,
  ADD COLUMN IF NOT EXISTS website           text,
  ADD COLUMN IF NOT EXISTS description       text;
```

Run this, then refresh the Table Editor and confirm all columns are present before continuing.

---

## 2. Verify the `application_requirements` table exists

Check that this table is present in your Table Editor. If it is not, run:

```sql
CREATE TABLE IF NOT EXISTS application_requirements (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id  uuid        NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  label          text        NOT NULL,
  required       boolean     NOT NULL DEFAULT true,
  format         text,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requirements_university
  ON application_requirements(university_id);
```

---

## 3. Populate `admissions_email` for existing universities

For every university already in your database, set the admissions email where you know it. You can do this two ways:

**Option A — directly in the Table Editor UI**

Click into any row → click the `admissions_email` cell → type the email → press Enter. Repeat for each university.

**Option B — SQL bulk update**

If you have several universities, it's faster to write them all at once in the SQL Editor:

```sql
UPDATE universities SET admissions_email = 'admissions@sofiauniversity.bg'
WHERE name = 'Sofia University';

UPDATE universities SET admissions_email = 'apply@tu-sofia.bg'
WHERE name = 'Technical University of Sofia';

UPDATE universities SET admissions_email = 'international@unss.bg'
WHERE name = 'University of National and World Economy';
```

Add one `UPDATE` statement per university. Universities left with `admissions_email = NULL` will not show the Apply button — that is correct behaviour.

---

## 4. Verify Row Level Security is enabled

Run this query in the SQL Editor to check RLS status:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('universities', 'application_requirements', 'application_history');
```

Every row should show `rowsecurity = true`. If any shows `false`, run:

```sql
ALTER TABLE universities              ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_requirements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_history       ENABLE ROW LEVEL SECURITY;
```

---

## 5. Verify RLS policies are in place

Run this to confirm the read and write policies exist:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

You should see at minimum:

| tablename | policyname | cmd |
|---|---|---|
| `universities` | `public read universities` | `SELECT` |
| `universities` | `service role write universities` | `ALL` |
| `application_requirements` | `public read requirements` | `SELECT` |
| `application_requirements` | `service role write requirements` | `ALL` |

If any are missing, run the relevant `CREATE POLICY` statements from the migration file.

---

## 6. Spot-check the data

Run a quick query to confirm the table looks correct:

```sql
SELECT id, name, admissions_email, country, city
FROM universities
ORDER BY name;
```

Confirm:
- Every row has a non-null `id` and `name`
- At least one row has a non-null `admissions_email` (you'll need this to test the Apply button in Step 1.5)
- At least one row has `admissions_email = NULL` (you'll need this to test the fallback state)

---

## Checklist

- [ ] All required columns exist on the `universities` table
- [ ] `application_requirements` table exists with the FK to `universities`
- [ ] `admissions_email` populated for at least one university
- [ ] At least one university intentionally left with `admissions_email = NULL` for testing
- [ ] RLS enabled on all three tables
- [ ] RLS policies confirmed present for `universities` and `application_requirements`

---

## Next step

→ **Step 1.3** — Define the `University` TypeScript type in `lib/types/university.ts`