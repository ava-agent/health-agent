# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chinese-language prenatal health check-up guide website (孕检套餐选网站) targeting Shanghai-area users planning pregnancy. Features an AI-powered chatbot assistant that answers questions about medical tests, terminology, and pregnancy preparation. Built with React + TypeScript + Vite, deployed on Vercel + Supabase.

All source code lives under `app/`.

## Commands

```bash
# All commands run from the app/ directory
cd app

npm install          # Install dependencies
npm run dev          # Start dev server (Vite HMR)
npm run build        # Type-check (tsc -b) then build for production
npm run lint         # ESLint
npm run preview      # Preview production build locally
```

## Architecture

### Page Structure (Single-Page App)

`App.tsx` renders a vertical scrolling page composed of section components, plus a floating AI chatbot. Global state is minimal — only `userAge` (number) is lifted to App and passed down to sections that need age-based recommendations.

Sections render in this order:
`Navigation → HeroSection → PackageSection → HospitalSection → ChecklistSection → PolicySection → GuideSection → CTASection → Footer`

The `AIAssistant` component floats globally over all sections.

### AI Service Layer (`src/services/`)

- **`aiConfig.ts`** — Demo mode config, system prompt, medical terms dictionary (`MEDICAL_TERMS`), age group definitions (`AGE_GROUPS`), and demo mode preset responses (`DEMO_RESPONSES`). Central data file for domain knowledge.
- **`aiService.ts`** — `AIService` class (singleton via `getAIService()`) that manages conversation history. In API mode calls Supabase Edge Function `health-chat`; in demo mode (default) returns keyword-matched preset responses locally.
- **`supabase.ts`** — Supabase client initialization and anonymous session ID management (localStorage-based UUID).

### Backend: Supabase

**Project**: `lvazmokpqrywaysgxspg` (ap-southeast-1)

**Edge Function `health-chat`**:
- Receives `{ message, conversationId, sessionId, userAge }` from frontend
- Loads conversation history from DB → calls OpenAI-compatible API with server-side key → stores messages → returns response
- API Key (`OPENAI_API_KEY`) lives only on the server (Supabase Secrets), never exposed to the browser
- Optional secrets: `AI_MODEL` (default: `gpt-3.5-turbo`), `AI_BASE_URL` (default: OpenAI)

**Database tables** (prefixed with `health_` to avoid conflicts with other apps in the same project):
- `health_conversations` — session_id, user_age, title, timestamps
- `health_messages` — conversation_id (FK), role, content, created_at
- RLS enabled with open anon access policies (no user auth required)

### Key Components (`src/components/`)

- **`AIAssistant.tsx`** — Floating chatbot widget with quick questions, age-specific advice, and safe React-based markdown rendering (no dangerouslySetInnerHTML).
- **`AgeSelector.tsx`** — Age picker (25-40 range) that drives personalized package recommendations. Reads age group config from `aiConfig.ts`.
- **`MedicalTerm.tsx`** — Inline medical term tooltip/popover that looks up explanations from the `MEDICAL_TERMS` dictionary and can query the AI service for deeper answers.

### UI Framework

- **shadcn/ui** (new-york style) with 40+ Radix-based components in `src/components/ui/`
- **Tailwind CSS v3** with custom color tokens: `teal` (primary brand), `coral` (accent/CTA), `mint` (backgrounds)
- **CSS variables** for shadcn theming defined in `src/index.css`
- Icons: `lucide-react`
- Animations: CSS transitions and custom Tailwind keyframes
- Fonts: Noto Serif SC (serif) and Noto Sans SC (sans)

### Path Aliases

`@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.app.json`).

### Environment Variables

All prefixed with `VITE_` (Vite convention for client-exposed env vars):
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous/publishable key
- `VITE_DEMO_MODE` — `true`/`false` (default: `true`). Set to `false` to use real AI via Edge Function.

### Deployment

- **Frontend**: Vercel (configured via `app/vercel.json`, root directory = `app`)
- **Backend**: Supabase Edge Functions + PostgreSQL
- **Vercel env vars needed**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_MODE=false`
- **Supabase secrets needed**: `OPENAI_API_KEY` (set in Dashboard → Edge Functions → Secrets)
