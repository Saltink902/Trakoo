# Trakoo

Private mobile-first PWA built with Next.js, TypeScript, Tailwind CSS, next-pwa, and Supabase.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and set your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anonymous/public key

3. **Supabase: migration + auth**

   - Run migrations so `mood_entries` and `poop_entries` exist:

     ```bash
     npx supabase db push
     ```

     Or run `supabase/migrations/001_mood_entries.sql` and `supabase/migrations/002_poop_entries.sql` in the Supabase SQL editor.

   - In Supabase Dashboard → **Authentication** → **Providers**, enable **Anonymous sign-ins** so the app can create a session and save moods without a login form.

4. **PWA icons** (optional)

   Add app icons to `public/icons/`:

   - `icon-192x192.png`
   - `icon-512x512.png`

   These are referenced in `public/manifest.json`.

## Scripts

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run lint` – run ESLint

## Stack

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **next-pwa** – PWA (service worker, manifest)
- **Supabase** – auth + database (`src/lib/supabase.ts`)
