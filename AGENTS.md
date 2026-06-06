# AGENTS.md

Guidance for AI agents working in the Gett-Clean repository.

## Repository status

This repository is currently an empty starter: a single `README.md` with the project title. There is no application source code, dependency manifest, test suite, linter configuration, or service definitions yet.

## Development commands

Until project scaffolding is added, there are no install, lint, test, build, or run commands defined in the repo.

| Action | Command | Status |
|--------|---------|--------|
| Clone / update | `git pull origin main` | Available |
| Install | — | Not defined |
| Lint | — | Not defined |
| Test | — | Not defined |
| Build | — | Not defined |
| Run (dev) | — | Not defined |

When code is added, document the real commands here and in `README.md`.

## Services

No services are required to run today. When the project is scaffolded, update this section with required vs optional services and how to start them.

## Cursor Cloud specific instructions

- **Update script**: No dependency refresh is needed; the VM update script is a no-op (`true`).
- **Git**: The repo is functional. Use `git pull origin main` to sync before starting work.
- **VM tooling**: Node.js (v22), npm/pnpm/yarn, Python 3.12, pip, and git are available on the Cloud Agent VM for future scaffolding.
- **No runnable app yet**: Do not expect ports, health checks, or E2E flows until source code and a dependency manifest (for example `package.json`, `pyproject.toml`, or `docker-compose.yml`) are committed.
- **When adding a stack**: Expand `README.md` with setup/run instructions, add the appropriate install command to the VM update script via `SetupVmEnvironment`, and replace the "Services" and "Development commands" sections above with concrete values.
