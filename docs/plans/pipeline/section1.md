# Section 1 — The Database Foundation

## Where you are now

You have all three tables created in Supabase and one university — Technical University Varna — with its admissions email already populated. The foundation exists. What needs to happen now is expanding the data so the pipeline has more to work with.

---

## What needs to be done

### 1. Verify the existing university record is complete

Go to Supabase dashboard → Table Editor → `universities` and confirm the Technical University Varna row has all of these fields filled in, not just the email:

- `name` — full official name
- `admissions_email` — already done
- `country` — Bulgaria
- `city` — Varna
- `website` — the university's homepage URL (you will need this for the seed process in the next section)

The `website` field is critical. Without it, the seed process that automatically extracts application requirements cannot visit the university's admissions page. If it is missing, add it now manually in the Table Editor.

### 2. Add more universities

One university is enough to test the pipeline end to end, but the app's value comes from having many. Start adding universities in the Bulgaria and Balkans region. For each one you need at minimum: name, country, city, website, and admissions email.

The fastest way to add several at once is directly in the Supabase SQL Editor:

```sql
INSERT INTO universities (name, country, city, website, admissions_email) VALUES
  ('Sofia University St. Kliment Ohridski', 'Bulgaria', 'Sofia', 'https://www.uni-sofia.bg', 'inter@uni-sofia.bg'),
  ('Technical University Sofia', 'Bulgaria', 'Sofia', 'https://tu-sofia.bg', 'admission@tu-sofia.bg'),
  ('University of National and World Economy', 'Bulgaria', 'Sofia', 'https://www.unwe.bg', 'inter@unwe.bg'),
  ('Plovdiv University Paisii Hilendarski', 'Bulgaria', 'Plovdiv', 'https://uni-plovdiv.bg', 'inter.office@uni-plovdiv.bg'),
  ('New Bulgarian University', 'Bulgaria', 'Sofia', 'https://nbu.bg', 'nbu@nbu.bg');
```

Replace the emails above with the real admissions emails — these are approximate. For each university, visit their website and find the correct international admissions contact before inserting.

### 3. Confirm the application_requirements table is empty and ready

At this stage, `application_requirements` should be empty — that is correct. It will be filled by the seed process described in the next section. You do not need to add anything here manually yet.

Run this in the SQL Editor to confirm it is empty and the foreign key relationship to `universities` is working:

```sql
SELECT
  u.name,
  COUNT(r.id) AS requirements_count
FROM universities u
LEFT JOIN application_requirements r ON r.university_id = u.id
GROUP BY u.name
ORDER BY u.name;
```

Every university should show `0` requirements. That is the expected state before the seed runs.

### 4. Confirm the application_history table is empty and ready

Same check — it should be empty at this point:

```sql
SELECT COUNT(*) FROM application_history;
```

Expected result: `0`. If it has rows from earlier testing, that is fine — they will not affect the pipeline.

### 5. Confirm RLS is active on all three tables

Run this to verify:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('universities', 'application_requirements', 'application_history');
```

All three should show `rowsecurity = true`. If any shows `false`, go back to the RLS SQL file and run the `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` statements for the affected tables.

---

## Technology you need for this section

Everything in this section is pure Supabase — no code, no external tools. You work directly in the Supabase dashboard. The SQL Editor handles bulk inserts and verification queries. The Table Editor handles individual row edits.

If you want to find admissions emails for multiple Bulgarian universities quickly, search for each university name followed by "international admissions email" or check the NAVET register at `https://www.navet.government.bg` which lists all accredited Bulgarian higher education institutions.

---

## You are done with this section when

- Technical University Varna has `name`, `city`, `country`, `website`, and `admissions_email` all filled in
- At least 3–5 more universities exist with the same fields populated
- `application_requirements` is empty and the foreign key is confirmed working
- All three tables have RLS enabled