# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension called "transf" that allows users to rotate web pages around a specified center point with a custom angle. Built using the WXT framework for modern browser extension development with React and TypeScript.

## Architecture

The extension follows WXT's entrypoint-based architecture:

- **Popup UI** (`src/entrypoints/popup/`): React-based interface with sliders for rotation controls (center X/Y coordinates as percentages, rotation angle in degrees). Uses `browser.runtime.sendMessage` to communicate with content scripts.
- **Content Script** (`src/entrypoints/content/index.ts`): Listens for messages from popup via `browser.runtime.onMessage.addListener` and applies CSS transforms to `document.documentElement` for page rotation.

Communication flow: Popup UI → `browser.runtime.sendMessage` → Content Script → DOM manipulation with CSS transforms.

## Development Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Generate extension zip for distribution
npm run zip

# Type checking
npm run typecheck

# Code formatting and linting
npm run format
npm run check

# Run tests
npm run test

# Format, lint, typecheck, and test (run before commits)
npm run check_all
```

## Extension Development

- WXT handles manifest generation and build process
- Development server runs on localhost:3000 with HMR
- Extension manifest includes `activeTab` and `tabs` permissions for page manipulation
- Built extension outputs to `.output/chrome-mv3/` directory
- Load the built extension in Chrome developer mode by selecting the output directory

## Code Quality

- Uses Biome for formatting and linting (configured in `biome.json`)
- Lefthook for pre-commit hooks that auto-format code
- TypeScript with strict configuration
- Vitest for testing framework