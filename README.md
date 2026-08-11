# Prathomix — AI Text & Document Humanizer

A hyper-premium, glassmorphism SaaS dashboard for turning AI-generated text
and documents into natural, human-sounding writing. Built with Next.js 14
(App Router), Tailwind CSS, Framer Motion, Lucide icons, and Supabase
(Auth, Postgres, Storage).

## 1. Install

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL/keys and an LLM provider (Ollama, Groq,
or Gemini — see `lib/llm.ts`).

To enable Google sign-in: Supabase Dashboard → Authentication → Providers →
Google, and add your OAuth client ID/secret from Google Cloud Console. Set
the authorized redirect URI to `https://<your-project>.supabase.co/auth/v1/callback`.

## 3. Set up the database + storage

Open the Supabase SQL editor and run `supabase/schema.sql`. It creates:

- `users` — mirrors `auth.users`, adds a `credits` balance (default 20),
  auto-populated on sign-up via a trigger.
- `generations` — history of every humanize request, including file uploads
  (`file_name`, `file_type`, `storage_path`, `status`), protected by
  row-level security.
- `decrement_credits(uid, amount)` — RPC that spends a credit after a
  successful generation.
- A private `documents` storage bucket with RLS policies so each user can
  only read/write files under their own `<user_id>/` folder.

## 4. Run it

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll land on the marketing page, then
`/login` to sign in (email/password or Google), then `/dashboard`.

## Project structure

```
app/
  page.tsx                    # public marketing/landing page
  login/page.tsx               # glassmorphism sign-in / sign-up page
  auth/callback/route.ts        # OAuth code-exchange handler
  dashboard/page.tsx             # protected dashboard (server component)
  api/process-file/route.ts       # upload → extract → humanize → regenerate → store
  api/download/route.ts            # re-signs a download URL for a past generation
  api/humanize/route.ts             # legacy plain-text endpoint (no file involved)
components/
  AuthForm.tsx                 # email/password + Google OAuth form
  DashboardShell.tsx             # client wrapper: header credits + dropzone + history
  FileDropzone.tsx                 # animated drag-and-drop upload zone
  HistoryTable.tsx                  # document history with download buttons
  AuroraBackground.tsx, Header.tsx, Footer.tsx, CategoryChips.tsx, ToneToggle.tsx,
  LoadingPhrases.tsx, SkeletonShimmer.tsx, Workspace.tsx (legacy text workspace)
lib/
  fileProcessing/
    types.ts        # shared DocBlock structure (heading/paragraph/bullet/numbered)
    extract.ts        # PDF (pdf-parse, heuristic) and DOCX (mammoth, exact) → DocBlock[]
    serialize.ts        # DocBlock[] <-> marked-up text the LLM round-trips
    generate.ts           # DocBlock[] → .docx (docx) or .pdf (pdf-lib)
  llm.ts             # humanizeText() for plain text, humanizeDocumentBlocks() for files
  supabase/
    client.ts    # browser client (@supabase/ssr)
    server.ts      # RSC/route-handler client, respects the caller's session + RLS
    admin.ts         # service-role client for privileged writes (bypasses RLS)
    middleware.ts      # session refresh + /dashboard route protection
middleware.ts        # wires lib/supabase/middleware.ts into Next's middleware
supabase/schema.sql   # tables, RLS policies, trigger, RPC, storage bucket
```

## How a file upload becomes a download

1. `FileDropzone` posts the file + category/tone as `multipart/form-data`
   to `/api/process-file`.
2. The route authenticates the caller, checks their credit balance, then
   reads the file into a `Buffer`.
3. `extractBlocks()` turns it into an ordered list of `DocBlock`s
   (`heading` / `paragraph` / `bullet` / `numbered`) — DOCX via `mammoth`'s
   real HTML output, PDF via `pdf-parse` text plus layout heuristics.
4. `blocksToPromptText()` serializes those blocks into a marked-up format
   (`[H2] ...`, `[BULLET] ...`, `[P] ...`) and sends it to
   `humanizeDocumentBlocks()`, which uses the strict system prompt that
   forbids merging/splitting lines or dropping markers.
5. `promptTextToBlocks()` parses the model's response back into
   `DocBlock`s, and `generateFile()` rebuilds a `.docx` (via the `docx`
   package) or `.pdf` (via `pdf-lib`, with manual word-wrapped text layout)
   matching the original file type.
6. The output is uploaded to the private `documents` storage bucket at
   `<user_id>/<generation_id>.<ext>`, a row is written to `generations`,
   a credit is spent via the `decrement_credits` RPC, and a one-hour signed
   URL is returned for immediate download.
7. `HistoryTable` lists past generations and calls `/api/download?id=` to
   mint a fresh signed URL whenever the original one has expired.

## Notes for production

- Route handlers on most hosts (e.g. Vercel serverless functions) have a
  request body size limit around 4.5MB by default — raise it if you need
  the full 10MB the dropzone allows, or move uploads to a background job.
- `pdf-lib`'s output is a clean, readable reconstruction — it won't
  pixel-match complex original PDF layouts (multi-column, embedded images),
  since it's rebuilding from extracted text rather than editing the
  original file in place.
