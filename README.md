# MarkDocs

MarkDocs is a markdown document management app built with Vue, TypeScript, Tailwind CSS, and Supabase. It supports live markdown preview and document management.

## Features

- Create, edit, duplicate, and delete markdown documents
- Live split-pane markdown editor and rendered preview
- Full-page preview mode
- Folder organization for documents
- Bulk document selection and deletion from the documents workspace
- Pinned documents and folders
- Recent documents menu in the editor
- Profile settings with password/email management
- Dark/light mode toggle from the user menu
- Markdown syntax highlighting
- Markdown and PDF export

## Tech Stack

- Vue 3
- TypeScript
- Tailwind CSS 4
- Pinia
- Vue Router
- Supabase
- `markdown-it`
- `highlight.js`
- `jspdf`

## Getting Started

### Prerequisites

- Node.js `^20.19.0 || >=22.12.0`
- npm
- A Supabase project

### Install

```bash
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Frontend environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Supabase Edge Function environment variables:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Notes:

- `VITE_SUPABASE_ANON_KEY` is expected to be public in the browser.
- Do not commit `.env` or any service role keys.

## Development

Run the app locally:

```bash
npm run dev
```

Other useful commands:

```bash
npm run build
npm run preview
npm run type-check
npm run lint
npm run format
```

## Supabase

The repo includes Supabase migrations and one Edge Function under [supabase/](/Users/giliannereyes/Desktop/Projects/markdown-editor/supabase).

Current committed backend coverage includes:

- `documents`
- `folders`
- `folder_documents`
- `pinned_items`
- `cancel_pending_email_change` RPC
- `cancel-pending-email-change` Edge Function

To apply migrations with the Supabase CLI, use your normal local workflow, for example:

```bash
supabase db push
```

If you use local Supabase development, make sure your local env/config matches the variables documented in `.env.example`.

## Routes

- `/` landing page
- `/register`
- `/signin`
- `/forgot-password`
- `/documents`
- `/editor/:id`
- `/preview/:id`
- `/profile`
- `/auth/callback`
- `/auth/reset-password`

## Project Structure

```text
src/
  assets/
  features/
    auth/
    documents/
    landing/
    profile/
  shared/
  router/
  stores/
supabase/
  functions/
  migrations/
```

## Security Notes

- `.env` is ignored and should stay private.
- Run a secret scan before publishing changes if you are unsure:

```bash
gitleaks git .
```

- Review Supabase RLS policies before deploying to production.

## License

Licensed under the Apache 2.0 license.
