# Phase 0: Project Initialization & Environment Setup

This document outlines the initial setup tasks for MediCRM, ensuring that your local environment is prepared for development and follows our established guidelines from [codebase-best-practices.md], [tech-stack.md], and related documentation.

---

# Phase 0: Project Initialization & Environment Setup

Below is a flattened, de-duplicated checklist. When a single step relates to both frontend and backend, we label it "GENERAL." Any large tasks with multiple bullet points have been split into multiple actionable steps. No earlier phases exist, so no overlaps are removed here.

---

[x] GENERAL: Create a new GitHub repository named medi-crm (or a similar variant).  
[x] GENERAL: Set up an initial main branch in the GitHub repository.  
[ ] GENERAL: Configure basic repo settings (branch protection, issue labels, etc.) as needed. // SKIP FOR NOW

[x] GENERAL: Install Node.js (LTS version) and confirm via "node -v."  
[x] GENERAL: Install a package manager (npm, pnpm, or yarn).  
[ ] GENERAL: (Optional) Install a Node version manager (e.g., nvm). // SKIP FOR NOW

[x] FRONTEND: (Next.js Project) Decide on a directory name and run "npx create-next-app@latest --typescript" to bootstrap the Next.js app in strict mode.  
[x] GENERAL: Move into the newly created project directory and open in a code editor.

[x] FRONTEND: Install Tailwind CSS (npm install -D tailwindcss postcss autoprefixer).  
[x] FRONTEND: Install Shadcn UI (shadcn@latest) and initialize needed components.  
[x] FRONTEND: Install Supabase client libraries (npm install @supabase/supabase-js).  
[x] FRONTEND: (Optional) Install additional dev tools (eslint, prettier, jest, testing-library) per tech-stack-rules.md.

[x] FRONTEND: Run "npx tailwindcss init -p" to create Tailwind configs.  
[x] FRONTEND: Update tailwind.config.js with Shadcn UI configs, referencing theme-rules.md.  
[x] FRONTEND: Create a globals.css file and import it in app/layout.tsx (or equivalent).

[x] BACKEND: Create a new Supabase project in the Supabase dashboard, noting the project URL and anon/public keys.  
[x] BACKEND: Add environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) to .env.  
[x] BACKEND: (Optional) Create a minimal test table or schema to verify database connectivity.

[x] GENERAL: Install ESLint and Prettier (npm install -D eslint prettier).  
[x] GENERAL: Generate an ESLint config (npx eslint --init) for Next.js + TS.  
[x] GENERAL: Align ESLint/Prettier settings with codebase-best-practices.md (strict typing, consistent style).

[x] GENERAL: Create the basic file/folder structure, following codebase-best-practices.md (app/(routes), components, lib, utils, docs/rules, etc.).  
[x] GENERAL: Add placeholder files as needed (e.g., app/(routes)/page.tsx, docs/rules/.gitkeep).

[x] GENERAL: Confirm the dev server runs (npm run dev) and displays a basic Next.js app.  
[x] GENERAL: Commit all initial changes and push to GitHub, verifying no lint or TS errors.
