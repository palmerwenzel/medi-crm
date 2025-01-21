# Phase 0: Project Initialization & Environment Setup

This document outlines the initial setup tasks for MediCRM, ensuring that your local environment is prepared for development and follows our established guidelines from [codebase-best-practices.md], [tech-stack.md], and related documentation.

---

# Phase 0: Project Initialization & Environment Setup

Below is a flattened, de-duplicated checklist. When a single step relates to both frontend and backend, we label it "GENERAL." Any large tasks with multiple bullet points have been split into multiple actionable steps. No earlier phases exist, so no overlaps are removed here.

---

## Phase 0: Flattened Checklist

[ ] GENERAL: Create a new GitHub repository named medi-crm (or a similar variant).  
[ ] GENERAL: Set up an initial main branch in the GitHub repository.  
[ ] GENERAL: Configure basic repo settings (branch protection, issue labels, etc.) as needed.

[ ] GENERAL: Install Node.js (LTS version) and confirm via “node -v.”  
[ ] GENERAL: Install a package manager (npm, pnpm, or yarn).  
[ ] GENERAL: (Optional) Install a Node version manager (e.g., nvm).

[ ] FRONTEND: (Next.js Project) Decide on a directory name and run “npx create-next-app@latest --typescript” to bootstrap the Next.js app in strict mode.  
[ ] GENERAL: Move into the newly created project directory and open in a code editor.

[ ] FRONTEND: Install Tailwind CSS (npm install -D tailwindcss postcss autoprefixer).  
[ ] FRONTEND: Install Shadcn UI (shadcn@latest) and initialize needed components.  
[ ] FRONTEND: Install Supabase client libraries (npm install @supabase/supabase-js).  
[ ] FRONTEND: (Optional) Install additional dev tools (eslint, prettier, jest, testing-library) per tech-stack-rules.md.

[ ] FRONTEND: Run “npx tailwindcss init -p” to create Tailwind configs.  
[ ] FRONTEND: Update tailwind.config.js with Shadcn UI configs, referencing theme-rules.md.  
[ ] FRONTEND: Create a globals.css file and import it in app/layout.tsx (or equivalent).

[ ] BACKEND: Create a new Supabase project in the Supabase dashboard, noting the project URL and anon/public keys.  
[ ] BACKEND: Add environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) to .env.  
[ ] BACKEND: (Optional) Create a minimal test table or schema to verify database connectivity.

[ ] GENERAL: Install ESLint and Prettier (npm install -D eslint prettier).  
[ ] GENERAL: Generate an ESLint config (npx eslint --init) for Next.js + TS.  
[ ] GENERAL: Align ESLint/Prettier settings with codebase-best-practices.md (strict typing, consistent style).

[ ] GENERAL: Create the basic file/folder structure, following codebase-best-practices.md (app/(routes), components, lib, utils, docs/rules, etc.).  
[ ] GENERAL: Add placeholder files as needed (e.g., app/(routes)/page.tsx, docs/rules/.gitkeep).

[ ] GENERAL: Confirm the dev server runs (npm run dev) and displays a basic Next.js app.  
[ ] GENERAL: Commit all initial changes and push to GitHub, verifying no lint or TS errors.
