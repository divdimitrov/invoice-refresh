# invoice-refresh

This app now persists **clients + documents + document versions** in **Supabase Postgres** (instead of `localStorage`).

## Supabase setup

1. Create a new Supabase project.
2. In Supabase, open **SQL Editor** and run the schema in [supabase/schema.sql](supabase/schema.sql).

## Environment variables

Create a `.env.local` (for dev) or set these in your hosting provider (Render):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

An example is provided in [.env.example](.env.example).

## Run locally

1. `npm install`
2. `npm run dev`

## Security note (important)

This frontend talks directly to Supabase using the **anon key**.

- For a quick MVP you can keep **RLS disabled** (default), but anyone with the app URL can read/write your tables.
- For production, enable **RLS** and add **Auth + policies** (or put an API backend in front of Supabase).
