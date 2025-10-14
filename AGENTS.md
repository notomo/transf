# Repository Guidelines

## Project Structure & Module Organization
transf is a WXT-powered React extension. Core code lives in `src`: `src/entrypoints/popup` for the popup UI, `src/lib` for shared logic, and `src/assets` for static files. Build and manifest settings are in `wxt.config.ts`, and TypeScript config in `tsconfig.json`. Playwright specs and page objects live in `e2e`, with shared setup in `e2e/fixtures.ts`. Builds are emitted to `.output`.

## Build, Test, and Development Commands
- `npm run dev`: launch the WXT dev server (Chrome on port 3000) with hot reload.
- `npm run build`: produce a production-ready bundle in `.output`.
- `npm run build:dev`: compile a development build used by Playwright CI tests.
- `npm run zip`: package the latest build for store submission.
- `npm run typecheck`: run the TypeScript compiler with `noEmit`.
- `npm run test`: execute Vitest suites (place new specs alongside source in `src`).
- `npm run test:e2e:ci`: run Playwright specs headlessly; use `npm run test:e2e:dev` before PRs to pre-build assets.
- `npm run check_all`: convenience task that formats, lints, type-checks, and runs e2e tests.

## Coding Style & Naming Conventions
Biome formats staged `*.ts`/`*.tsx`/`*.json` via Lefthook; keep changes staged so it can rewrite files. Use spaces for indentation, double quotes for strings, and organized imports. Name React components in PascalCase, shared utilities in camelCase, and keep related hooks with their component. Tailwind class strings should stay sorted (Biome `useSortedClasses`), and export helpers by name.

## Testing Guidelines
Use Vitest for logic coverage and Playwright for user journeys. Name Playwright specs `feature-name.spec.ts` in `e2e`, keeping shared utilities in `e2e/pages` and `e2e/fixtures.ts`. Run `npm run test` before committing helper changes, and `npm run test:e2e:dev` when touching UI flows.

## Commit & Pull Request Guidelines
Follow Conventional Commit prefixes (`feat`, `fix`, `refactor`, etc.) visible in `git log --oneline`. Add body notes for notable UX or manifest changes. Before a PR, run `npm run check_all`, attach screenshots for UI updates, and link issues. Call out new permissions or environment variables in the PR description.
