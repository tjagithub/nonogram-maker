# Nonogram Maker

A desktop nonogram (picross) puzzle generator built with **Tauri 2**, **React**, **TypeScript**, and **Tailwind CSS**.

Upload any image, choose a grid size, and generate a playable nonogram puzzle. Fill the correct cells to reveal the hidden image.

## Screenshots

| Main Menu | Puzzle in progress | Solved |
|---|---|---|
| ![Main Menu](screenshots/main-menu.png) | ![Grid with cells filled](screenshots/grid-with-cells.png) | ![Puzzle Complete](screenshots/puzzle-complete.png) |

## Features

- **Image → Puzzle** — upload any image, automatically converted into a nonogram
- **3 grid sizes** — 8×8, 16×16, 32×32 with configurable mistake limits
- **Click + drag** — fill or X-mark cells in a single drag motion
- **Row/column helpers** — click ◀/▼ arrows to X-mark entire rows or columns
- **Hint mode** — checks progress and flashes incorrect cells
- **Solve modes** — instant reveal or animated step-by-step cell fill
- **Flip timer** — starts on first interaction, station-clock style display
- **Mistake tracker** — visual X counters, game over at the limit
- **5 color themes** — Crimson, Ocean, Forest, Amber, Violet
- **Frosted glass UI** — translucent panels with backdrop blur

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Tauri 2](https://v2.tauri.app) (Rust) |
| Frontend | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build | [Vite 8](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Testing | [Playwright](https://playwright.dev) (E2E) |
| Linting | [Biome](https://biomejs.dev) |

## Getting Started

```bash
# Install dependencies
npm install

# Run in development
npm run tauri dev

# Run frontend only (for UI work)
npm run dev
```

## Testing

```bash
# Run all E2E tests
npm run test:e2e

# Run with visible browser
npx playwright test --headed
```

## Linting

```bash
npm run lint       # Check
npm run format     # Auto-fix
```

## Building

```bash
npm run tauri build
```

The production binary will be in `src-tauri/target/release/`.
