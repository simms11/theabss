# Contributing

- Branch from `main`; open a PR. CI runs lint, typecheck, prettier, tests, build and Playwright.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `chore:`, `docs:`, `test:`. One logical change per commit.
- After changing a collection or global, regenerate the types and schema files (`pnpm generate:types`, `pnpm migrate:create`) and commit them.
- Run `pnpm check` before pushing.
- New dependencies need a one-line justification in the commit message.
