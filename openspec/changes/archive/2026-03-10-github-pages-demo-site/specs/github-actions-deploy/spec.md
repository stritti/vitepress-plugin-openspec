## ADDED Requirements

### Requirement: Workflow file exists at the expected path
A GitHub Actions workflow file SHALL exist at `.github/workflows/deploy-docs.yml`.

#### Scenario: Workflow file is present
- **WHEN** the repository is cloned
- **THEN** `.github/workflows/deploy-docs.yml` exists and is valid YAML

### Requirement: Workflow triggers on push to main
The workflow SHALL be configured to run on every push to the `main` branch.

#### Scenario: Push to main triggers the workflow
- **WHEN** a commit is pushed to `main`
- **THEN** the `deploy-docs` workflow is triggered automatically

### Requirement: Workflow builds plugin before building docs
The workflow's build job SHALL run `npm run build` (plugin build) before `npm run docs:build` (VitePress build) to ensure the local plugin reference resolves to current output.

#### Scenario: Build step order is correct
- **WHEN** the workflow job steps are inspected
- **THEN** the plugin `build` step appears before the `docs:build` step

### Requirement: Workflow deploys to GitHub Pages using official actions
The workflow SHALL use `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` to publish the built site.

#### Scenario: Deployment uses official GitHub Pages actions
- **WHEN** the workflow YAML is inspected
- **THEN** it references `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`

### Requirement: Workflow has correct permissions for Pages deployment
The workflow job SHALL declare `pages: write` and `id-token: write` permissions required by the GitHub Pages deployment actions.

#### Scenario: Required permissions are declared
- **WHEN** the workflow YAML is inspected
- **THEN** the deploy job includes `permissions: { pages: write, id-token: write }`

### Requirement: Workflow installs dependencies for both root and docs packages
The workflow SHALL run `npm ci` (or equivalent) for the root package and for the `docs/` sub-package so that all dependencies are available during the build.

#### Scenario: Both install steps are present
- **WHEN** the workflow job steps are inspected
- **THEN** there is an install step for the root package and a separate install step for the `docs/` sub-package (or a single step covering both)
