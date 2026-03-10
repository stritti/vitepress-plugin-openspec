## 1. docs Sub-Package Setup

- [x] 1.1 Create `docs/` directory and create `docs/package.json` manually (bun init or by hand)
- [x] 1.2 Add `vitepress` as a dev dependency in `docs/package.json` (`bun add -d vitepress` inside `docs/`)
- [x] 1.3 Add `vitepress-plugin-openspec` as a dependency in `docs/package.json` using `file:../` local reference (`bun add ../`)
- [x] 1.4 Add `docs:dev` and `docs:build` scripts to root `package.json` (delegating to `bun --cwd docs run dev` / `bun --cwd docs run build`)
- [x] 1.5 Add `docs/node_modules/` and `docs/.vitepress/dist/` to `.gitignore`

## 2. VitePress Configuration

- [x] 2.1 Create `docs/.vitepress/config.ts` with `defineConfig`, registering `openspec()` as a Vite plugin pointing at `docs/petstore.yaml` with `outDir: 'api'`
- [x] 2.2 Configure `themeConfig.nav` to include an "API Reference" entry linking to `/api/`
- [x] 2.3 Configure `themeConfig.sidebar` using `generateSidebarFromSpec()` for the `/api/` prefix
- [x] 2.4 Set `base` in VitePress config to match the GitHub Pages URL path (e.g. `/vitepress-plugin-openspec/`)

## 3. Demo Content

- [x] 3.1 Copy `src/__tests__/petstore.yaml` to `docs/petstore.yaml`
- [x] 3.2 Create `docs/index.md` with VitePress hero layout (`layout: home`) — title, tagline, and a "Get Started" action linking to `/api/`
- [x] 3.3 Run `bun run docs:build` locally and verify `docs/.vitepress/dist/api/` contains generated endpoint pages

## 4. GitHub Actions Workflow

- [x] 4.1 Create `.github/workflows/deploy-docs.yml` with trigger on `push` to `main`
- [x] 4.2 Add install step: `oven-sh/setup-bun@v2` + `bun install --frozen-lockfile` at repo root
- [x] 4.3 Add install step: `bun install --frozen-lockfile` inside `docs/` (`bun --cwd docs install`)
- [x] 4.4 Add build step: `bun run build` (plugin)
- [x] 4.5 Add build step: `bun run docs:build`
- [x] 4.6 Add `actions/configure-pages` step
- [x] 4.7 Add `actions/upload-pages-artifact` step pointing at `docs/.vitepress/dist/`
- [x] 4.8 Add `actions/deploy-pages` step in a separate deploy job
- [x] 4.9 Declare `permissions: { pages: write, id-token: write }` on the deploy job

## 5. Validation

- [x] 5.1 Run `bun run docs:build` locally and confirm zero errors
- [x] 5.2 Verify built `dist/` contains `index.html` and `api/` subdirectory
- [x] 5.3 Validate workflow YAML syntax (`act --list` or GitHub's YAML linter)
- [ ] 5.4 Enable GitHub Pages on the repository (Settings → Pages → Source: GitHub Actions) — one-time manual step
- [ ] 5.5 Push to `main` and confirm workflow completes successfully and site is live
