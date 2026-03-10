## 1. docs Sub-Package Setup

- [ ] 1.1 Create `docs/` directory and create `docs/package.json` manually (bun init or by hand)
- [ ] 1.2 Add `vitepress` as a dev dependency in `docs/package.json` (`bun add -d vitepress` inside `docs/`)
- [ ] 1.3 Add `vitepress-plugin-openspec` as a dependency in `docs/package.json` using `file:../` local reference (`bun add ../`)
- [ ] 1.4 Add `docs:dev` and `docs:build` scripts to root `package.json` (delegating to `bun --cwd docs run dev` / `bun --cwd docs run build`)
- [ ] 1.5 Add `docs/node_modules/` and `docs/.vitepress/dist/` to `.gitignore`

## 2. VitePress Configuration

- [ ] 2.1 Create `docs/.vitepress/config.ts` with `defineConfig`, registering `openspec()` as a Vite plugin pointing at `docs/petstore.yaml` with `outDir: 'api'`
- [ ] 2.2 Configure `themeConfig.nav` to include an "API Reference" entry linking to `/api/`
- [ ] 2.3 Configure `themeConfig.sidebar` using `generateSidebarFromSpec()` for the `/api/` prefix
- [ ] 2.4 Set `base` in VitePress config to match the GitHub Pages URL path (e.g. `/vitepress-plugin-openspec/`)

## 3. Demo Content

- [ ] 3.1 Copy `src/__tests__/petstore.yaml` to `docs/petstore.yaml`
- [ ] 3.2 Create `docs/index.md` with VitePress hero layout (`layout: home`) — title, tagline, and a "Get Started" action linking to `/api/`
- [ ] 3.3 Run `bun run docs:build` locally and verify `docs/.vitepress/dist/api/` contains generated endpoint pages

## 4. GitHub Actions Workflow

- [ ] 4.1 Create `.github/workflows/deploy-docs.yml` with trigger on `push` to `main`
- [ ] 4.2 Add install step: `oven-sh/setup-bun@v2` + `bun install --frozen-lockfile` at repo root
- [ ] 4.3 Add install step: `bun install --frozen-lockfile` inside `docs/` (`bun --cwd docs install`)
- [ ] 4.4 Add build step: `bun run build` (plugin)
- [ ] 4.5 Add build step: `bun run docs:build`
- [ ] 4.6 Add `actions/configure-pages` step
- [ ] 4.7 Add `actions/upload-pages-artifact` step pointing at `docs/.vitepress/dist/`
- [ ] 4.8 Add `actions/deploy-pages` step in a separate deploy job
- [ ] 4.9 Declare `permissions: { pages: write, id-token: write }` on the deploy job

## 5. Validation

- [ ] 5.1 Run `bun run docs:build` locally and confirm zero errors
- [ ] 5.2 Verify built `dist/` contains `index.html` and `api/` subdirectory
- [ ] 5.3 Validate workflow YAML syntax (`act --list` or GitHub's YAML linter)
- [ ] 5.4 Enable GitHub Pages on the repository (Settings → Pages → Source: GitHub Actions) — one-time manual step
- [ ] 5.5 Push to `main` and confirm workflow completes successfully and site is live
