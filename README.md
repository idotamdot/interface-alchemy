## Screen Seer Studio — Professional Visual Atelier (October 2026)

**Interface Alchemy owns the application's visual identity, independently of UX Designer Studio's wireframes.** The Screen Seer Studio is an art-direction workspace—not a substitute for designing product behavior.

### Atelier rooms

| Room | Present source-level capability |
| --- | --- |
| **01 / Creative Brief** | Describe a desired visual appearance, choose inspiration and request up to three directions |
| **02 / The Salon** | Review generated concepts, sample-screen previews, contrast checks, model critique, select and save directions |
| **03 / Compare** | Review two generated directions side by side with their actual palettes and visual samples |
| **04 / Materials** | Inspect a selected direction's six palette tokens, sample controls and measured solid-color contrast |
| **05 / The Stage** | Switch between desktop, tablet and mobile widths and three **illustrative** landing/dashboard/form compositions |

The Studio includes an existing color-spiral exploration and a consent-based design portfolio. The Atelier's look uses a restrained obsidian/pearl/violet/glacier visual language. Sample compositions are not imported UX wireframes; labels must not imply the underlying controls or workflows have been implemented.

### Handoff to Website Builder

1. Generate and **select** a visual direction in Screen Seer Studio.
2. Use **Download visual style package**. This produces a JSON `screen-seer-visual/v1` export, validated against the `src/lib/visual-style-package.ts` schema, with the six contrast-checked color tokens and explicit **not verified** flags for rendered accessibility and implementation.
3. In `idotamdot/website-builder`, open the visual-style JSON separately from the accepted UX package produced by `idotamdot/user-experience-designer-studio`.
4. Builder can display the two together and save a combined review without rewriting their underlying source contracts.

**Not yet implemented:** automated cross-app synchronization, actual imported UX wireframe styling in the Atelier Stage, a complete typography/spacing/motion token system, or finished Builder-generated functionality. Download-and-import is the current connection. Production deployment success is distinct from successful tests and end-to-end browser validation.

**Contracts and source:** `src/lib/seer-contract.ts`, `src/lib/visual-style-package.ts`, `src/components/chat/ChatInterface.tsx`, `src/components/chat/MaterialsLibrary.tsx`, `src/components/chat/AtelierStage.tsx`, and `docs/SCREEN-SEER-ATELIER.md`.

### Focused verification

```bash
pnpm typecheck
pnpm test:run
pnpm build
```

The integration tests and build checks should run on the actual commit being released. A Vercel READY status does not, by itself, prove that interactive export/import was tested.

# UIGen

AI-powered React component generator with live preview, persistent projects, and magic-link authentication.

## Interface Alchemy roadmap

The canonical branding and product-transformation checklist lives in [`docs/INTERFACE-ALCHEMY-TODO.md`](docs/INTERFACE-ALCHEMY-TODO.md).

Use that roadmap to track the Chromatic Void design system, living-edge signature, logo and wordmark, landing page, Generative Cockpit, Matter Panel, Stage, Conductor, Synthesis Mode, Intent Capsules, direct visual revision, version constellations, product modes, typography, sound, and UX safeguards.

## Prerequisites

- Node.js 18+
- pnpm
- Neon Postgres database
- Neon Auth configured for the deployed Interface Alchemy domain
- Anthropic API key

## Environment setup

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://user:password@pooler-host/database?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@direct-host/database?sslmode=require
NEON_AUTH_BASE_URL=https://your-neon-auth-endpoint.example
NEON_AUTH_COOKIE_SECRET=a-unique-random-secret-of-at-least-32-characters
ANTHROPIC_API_KEY=sk-ant-...
ENABLE_DEV_MOCK_PROVIDER=false
```

`DATABASE_URL` is the pooled runtime connection and `DATABASE_URL_UNPOOLED` is the direct connection. Those names match the variables already injected by the Neon integration in Vercel. Prisma uses the pooled URL for application queries and the unpooled URL for direct migration/administrative access. Neon Auth maintains identity and provider-session records separately in Neon’s auth schema.

`NEON_AUTH_BASE_URL` must point to the Neon Auth service for the same branch/database used by the deployment. `NEON_AUTH_COOKIE_SECRET` protects the Neon Auth server cookie layer and must remain server-only.

`ANTHROPIC_API_KEY` is required for real generation. `ENABLE_DEV_MOCK_PROVIDER` defaults to `false`, may only be enabled in development or tests, and is rejected in production.

Do not commit `.env` or any real secret.

## Install and initialize

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
```

For a local development database where creating migrations is intentional, use Prisma’s development migration workflow instead of `migrate deploy`.

> Do not run `npm audit fix` or an equivalent forced dependency rewrite. Dependencies are pinned as a compatible set. Update flagged packages deliberately and validate typecheck, lint, tests, and production build afterward.

## Development

```bash
pnpm dev
```

Open `http://localhost:3000`.

Local magic-link authentication also requires `allow_localhost` to be enabled for the Interface Alchemy Neon Auth configuration. Production and preview callbacks must use an origin listed in Neon Auth's trusted origins.

## Production validation

```bash
pnpm typecheck
pnpm lint
pnpm test --run
pnpm build
```

Plain `pnpm test` starts Vitest watch mode. Use `pnpm test --run` for a one-time pass in release checks and CI.

## Authentication flow

1. A visitor can begin work anonymously.
2. The visitor requests a Neon magic link.
3. Managed Better Auth verifies the one-time link and returns the browser to `/auth/complete` on the Interface Alchemy origin.
4. The Neon SDK completes the app-origin session handoff; Interface Alchemy reads that Managed Better Auth session directly, resolves the application user by stable email identity, and restores the pending workspace.
5. Registered users retain persistent projects in Neon Postgres.

The production origin must be allowed by Neon Auth. The callback is kept relative (`/auth/complete`) so it stays on the current trusted app origin. Cookie-secret changes require a new deployment before production functions and middleware use the new value.

## Usage

1. Continue anonymously or sign in with a magic link.
2. Describe the React component or interface you want in the chat.
3. Review generated output in the live preview.
4. Open Code view to inspect or edit the virtual files.
5. Continue iterating with the AI.
6. Export the generated code when ready.

## Features

- AI-powered React generation using Anthropic Claude
- Live preview with hot reload
- Virtual file system with validated edit tools
- Syntax highlighting and code editor
- Anonymous-work preservation through sign-in
- Persistent projects for registered users
- Exportable generated code

## Tech stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- Neon Postgres and Neon Auth
- Anthropic Claude
- Vercel AI SDK
