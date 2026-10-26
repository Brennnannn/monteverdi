# Monteverdi

An orchestration tool for Claude.

## Develop

```bash
pnpm install
pnpm dev
```

`src/ui` is a copy of `@bear-behavior/ui` (v2.2.0) and is imported as `@ui`. It's vendored source, so edit it in place.

## How it fits together

- `src/`: the React app. `src/components/app-shell.tsx` is the outer layout (nav bar + route) and redirects to `/setup` until setup is complete.
- `server/`: a small local API mounted on the Vite server under `/api`. The browser can't run the Claude CLI or read the filesystem, so those calls live here.
- `shared/`: types used by both sides.

## Setup

`/setup` needs two things before the rest of the app opens:

1. **Claude CLI signed in.** Monteverdi looks for `claude` in `MONTEVERDI_CLAUDE_BIN`, then on `PATH`, then `~/.local/bin`, then the copy bundled with the Claude desktop app. "Sign in" runs `claude auth login --claudeai` in a new console window. This is the CLI's own global sign-in (`~/.claude`), so it's shared with any other `claude` use on the machine.
2. **A project folder.** Its `.env` is the one Monteverdi uses. Type a path, pick one of the last 5 from the dropdown, or use "Select Folder" for the Windows folder dialog. Saved to `~/.monteverdi/config.json`.
