# Student Application Pipeline — Execution Plan

## Overview

This pipeline is triggered by a single button click and moves through five stages: **Trigger → Requirements → Upload → Compose → Send**. It spans four layers: the student's browser, the Next.js app, the Claude API, and Supabase.

---

## Stage 1 — Trigger

**Goal:** Render the Apply button only when an application destination exists, and route the student to the pipeline.

### Next.js app
- [ ] On the university detail page, query Supabase for the university record and check whether `admissions_email` is non-null
- [ ] If `admissions_email` is present → render the **Apply Now** button (primary style, visible)
- [ ] If `admissions_email` is missing → render a muted "Application contact not available" text instead — no button
- [ ] On button click, call `router.push('/apply/' + universityId)` — no API call needed at this point

### Supabase
- [ ] Ensure the `universities` table has an `admissions_email` column (`text`, nullable)
- [ ] Populate `admissions_email` for all existing university records where known

---

## Stage 2 — Requirements

**Goal:** Load and display a clean, grouped list of required documents before asking the student to upload anything.

### Next.js app — page load
- [ ] Create the route `app/apply/[universityId]/page.tsx`
- [ ] On page load, call `requirementsAgent(universityId)` server-side
- [ ] Render the returned grouped requirements as a read-only checklist (Stage 1 panel of the three-stage UI)
- [ ] Show a "I have all required documents — continue" button that advances to Stage 2

### Supabase
- [ ] Ensure the `application_requirements` table exists with columns: `id`, `university_id` (FK), `label`, `required` (boolean), `format` (e.g. `"PDF"`), `notes` (nullable text)
- [ ] Run the seed script (`scripts/seedRequirements.ts`) to populate requirements for all existing universities
- [ ] On fallback (empty result): after live extraction, upsert the new requirements back into this table so the next student doesn't re-trigger a live fetch

### Claude API — `requirementsAgent`
- [ ] Create `lib/agents/requirementsAgent.ts`
- [ ] Query `application_requirements` from Supabase where `university_id` matches
- [ ] If records exist: send them to Claude with the prompt — *"Rewrite these application requirements in clear, student-friendly English. Group them into: Identity Documents, Academic Records, Language Certificates, Financial Documents, Other. Return JSON only."*
- [ ] If no records exist (fallback): fetch the university's admissions page via Playwright, extract requirements live with Claude, upsert to Supabase, then return the grouped result
- [ ] Cache the agent result in-memory (simple `Map` with 1-hour TTL) to avoid repeated Claude calls for the same university

---

## Stage 3 — Upload

**Goal:** Collect all required documents and student details, validate them client-side before proceeding.

### Next.js app — upload form (Stage 2 panel)
- [ ] Render one file input per required document, labelled exactly as the requirement name
- [ ] Show format hint under each input (e.g. "PDF only, max 5 MB")
- [ ] Add a textarea for a short personal statement (labelled: "3–5 sentences introducing yourself and why you're applying")
- [ ] Add fields for: student full name, current school or university, program applying for
- [ ] On "Continue" click, run client-side validation:
  - [ ] All `required: true` documents have a file attached
  - [ ] Each file's MIME type matches the expected format (`application/pdf` for PDF fields)
  - [ ] Each file is under 5 MB
- [ ] On validation failure: show inline error message per field — not a global alert
- [ ] On validation pass: call `POST /api/apply/compose` with the form data

---

## Stage 4 — Compose

**Goal:** Generate a professional application email and build the `mailto:` URL.

### Next.js app — API route
- [ ] Create `app/api/apply/compose/route.ts`
- [ ] Accept request body: `{ universityId, programName, studentName, personalStatement, fileNames[] }`
- [ ] Query Supabase for `admissions_email` using `universityId`
- [ ] Call Claude to compose the email
- [ ] Call `buildMailtoUrl({ to, subject, body })` with the composed content
- [ ] Return `{ mailtoUrl, subject, body }` to the frontend

### Supabase
- [ ] Query the `universities` table: `select admissions_email where id = universityId`
- [ ] This is a simple read — no write needed at this stage

### Claude API — email composer agent
- [ ] Create `lib/agents/emailComposerAgent.ts`
- [ ] System prompt: *"You write professional university application emails. Return ONLY valid JSON: `{ subject: string, body: string }`. Use `\r\n` for line breaks. Max 200 words for the body."*
- [ ] User message: pass student name, program, university name, personal statement, and list of file names
- [ ] Parse the JSON response; on failure return a hardcoded fallback template so the student is never blocked
- [ ] Return `{ subject, body }` to the compose route

### Next.js app — `lib/mailto.ts`
- [ ] Create the `buildMailtoUrl` utility function
- [ ] Encode subject and body with `encodeURIComponent`
- [ ] Use `\r\n` for line breaks in the body (required by Outlook)
- [ ] Return a fully formed `mailto:to?subject=...&body=...` string

---

## Stage 5 — Send

**Goal:** Show the student a preview, open their email client, and log the application.

### Next.js app — preview screen (Stage 3 panel)
- [ ] Display the recipient email address, composed subject line, and email body in a read-only styled card
- [ ] Show a "Before you send" checklist listing all uploaded file names with the instruction to attach them manually
- [ ] Provide an "Edit email" button that puts the body into an editable textarea
- [ ] On "Open email client" click: call `window.location.href = mailtoUrl`
- [ ] After the click, show confirmation text: *"Your email client should have opened. Attach the files listed above and hit send."*

### Supabase (future — auth required)
- [ ] `application_history` table: `id`, `university_id` (FK), `university_name`, `program`, `student_name`, `file_names` (array), `email_subject`, `sent_at`
- [ ] Once Supabase Auth is added: insert a record here on send with the authenticated `user_id`

### Browser localStorage (current — no auth)
- [ ] Immediately on "Open email client" click, write to `localStorage` key `uni_applications`:
  ```json
  {
    "id": "<nanoid>",
    "universityName": "...",
    "universityId": "...",
    "program": "...",
    "dateSent": "<ISO timestamp>",
    "fileNames": ["transcript.pdf", "..."],
    "emailSubject": "..."
  }
  ```
- [ ] Create `app/my-applications/page.tsx` that reads from `localStorage` and renders a history table: university, program, date, files
- [ ] Add a link to `/my-applications` in the main navigation

---

## Supporting infrastructure

### Supabase schema checklist
- [ ] `universities` table includes: `id`, `name`, `admissions_email` (nullable), `website`, `country`, `city`
- [ ] `application_requirements` table: `id`, `university_id` (FK → universities), `label`, `required` (bool), `format`, `notes`
- [ ] `application_history` table (create now, use after auth): `id`, `user_id` (nullable FK), `university_id` (FK), `university_name`, `program`, `student_name`, `file_names` (text[]), `email_subject`, `sent_at`
- [ ] Enable Row Level Security on `application_history` — restrict reads to `user_id = auth.uid()` once auth is live

### Shared utilities to create
- [ ] `lib/mailto.ts` — `buildMailtoUrl(params)` function
- [ ] `lib/supabase.ts` — shared Supabase client (use `@supabase/supabase-js`, read from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] `lib/claude.ts` — shared Anthropic client (read from `ANTHROPIC_API_KEY`)
- [ ] `lib/agents/requirementsAgent.ts`
- [ ] `lib/agents/emailComposerAgent.ts`

### Environment variables to add to `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (for server-side seed script only — never expose to client)
- [ ] `ANTHROPIC_API_KEY`

### One-time seed script
- [ ] Create `scripts/seedRequirements.ts`
- [ ] For each university in the `universities` table with a known website: fetch admissions page → extract requirements with Claude → upsert to `application_requirements`
- [ ] Run once: `npx ts-node scripts/seedRequirements.ts`

---

## Build order

Execute in this sequence — each stage depends on the previous one being complete.

1. Create Supabase tables and populate `admissions_email` for existing universities
2. Create `lib/supabase.ts`, `lib/claude.ts`, `lib/mailto.ts`
3. Run the seed script to populate `application_requirements`
4. Build `requirementsAgent` and the `/apply/[universityId]` page (Stage 1 panel only)
5. Build the upload form (Stage 2 panel) with client-side validation
6. Build the compose API route and `emailComposerAgent`
7. Build the preview and send screen (Stage 3 panel) including localStorage write
8. Build `/my-applications` history page
9. Add the conditional Apply Now button to the university detail page