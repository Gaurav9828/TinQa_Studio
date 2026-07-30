# TinQa Platform

LED Matrix Development & Diagnostics Platform.

A monorepo containing the React Studio, Raspberry Pi Agent, ESP32 firmware, and shared packages used to develop, emulate, and diagnose LED matrix panels.

---

## Project Structure

```
tinqa-platform/
├── apps/
│   ├── studio-web/
│   ├── pi-agent/
│   └── simulator-cli/
├── firmware/
├── packages/
├── scripts/
└── README.md
```

---

## Prerequisites

- Node.js 22+
- Yarn 1.22+

Verify:

```bash
node -v
yarn -v
```

---

## Getting Started

Clone the repository.

```bash
git clone <repository-url>
cd tinqa-platform
```

Install dependencies.

```bash
yarn install
```

Start the development server.

```bash
yarn dev
```

The application will be available at:

```
http://localhost:3000
```

---

## Available Commands

| Command | Description |
|----------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build production bundle |
| `yarn preview` | Preview production build |
| `yarn lint` | Run ESLint |

---

## Tech Stack

- React 19
- TypeScript
- Vite
- SCSS Modules
- ESLint
- Yarn Workspaces

---

## Development Guidelines

- Use TypeScript Strict Mode.
- Use SCSS Modules (`*.module.scss`).
- Prefer alias imports (`@shared`, `@layouts`, etc.).
- Follow feature-based architecture.
- Keep components small and reusable.

---

## Troubleshooting

Reinstall dependencies after pulling changes that modify `package.json`.

```bash
rm -rf node_modules yarn.lock
yarn install
yarn add -D -W sass-embedded
```