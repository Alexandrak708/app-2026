-- Profile detail columns for the editable profile screen.
-- Email is NOT stored here; it lives in auth.users and is changed via
-- supabase.auth.updateUser({ email }).
--
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- Safe to re-run: every statement is guarded with "if not exists".

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists phone      text,
  add column if not exists address    text,
  add column if not exists region     text;
