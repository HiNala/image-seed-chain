SeedChain monorepo

Packages
- apps/web: Next.js App Router app

Requirements
- Node >=18
- pnpm >=9

Commands
- pnpm install
- pnpm dev (runs all dev scripts via Turborepo)

Apps/web stack
- Next.js, TypeScript, Tailwind
- PostCSS + Autoprefixer
- SWR, Framer Motion, Zod
- OpenAI, @vercel/blob

Environment variables
- OPENAI_API_KEY: OpenAI API key with access to DALL-E models (dall-e-2, dall-e-3)
- BLOB_READ_WRITE_TOKEN: Vercel Blob read/write token
- NEXT_PUBLIC_BASE_URL: Base URL (e.g., http://localhost:3000 or your production domain)

Vercel deploy (first deploy checklist)
- Create a Vercel project and connect this repo
- Create a Blob store (Vercel Dashboard → Storage → Blob) and generate a Read-Write token
- Set Project → Settings → Environment Variables:
  - OPENAI_API_KEY
  - BLOB_READ_WRITE_TOKEN
  - NEXT_PUBLIC_BASE_URL (e.g., https://<your-domain>)
- Deploy to Production
- Visit the site: the app bootstraps with a genesis seed, history is empty; evolving writes PNGs to Blob

Caching & headers
- API endpoints set no-store (see vercel.json)
- History PNGs are immutable and public; current.json is public with short/volatile caching handled via API no-store (clients poll)

Backup
- To export Blob objects regularly, list with @vercel/blob and mirror to S3 or local:
  - List prefix seed/history and stream downloads; store JSON sidecars alongside PNGs
  - Vercel community guide: Blob backup strategies

Local dev
- pnpm install
- Copy apps/web/.env.example to apps/web/.env.local and fill values
- pnpm dev then open http://localhost:3000
