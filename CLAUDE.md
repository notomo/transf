# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension called "transf" that allows users to transform web pages with rotation, scaling, and translation effects around a specified center point. Built using the WXT framework for modern browser extension development with React and TypeScript.

## Architecture

The extension follows WXT's entrypoint-based architecture:

- **Popup UI** (`src/entrypoints/popup/`): React-based interface with sliders for transformation controls (center X/Y coordinates as percentages, rotation angle in degrees, scale factor, and translation in pixels). Uses `browser.scripting.executeScript` for direct code injection.
- **Content Script Injection**: Uses `browser.scripting.executeScript` to directly inject transformation code into active tabs, applying CSS transforms to `document.documentElement` for page transformation (rotation, scaling, translation).

Communication flow: Popup UI → `browser.scripting.executeScript` → Direct DOM manipulation with CSS transforms for comprehensive page transformation.

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

# Run e2e tests (builds dev extension and runs Playwright tests)
npm run test:e2e:dev

# File naming lint (kebab-case)
npm run ls-lint

# Format, lint, typecheck, and file naming (run before commits)
npm run check_all

# Take screenshots of extension UI
npm run screenshot
```

## Taking Screenshots

To take screenshots of the extension UI for agents or documentation:

```bash
npm run screenshot
```

This command will:
1. Build the extension in development mode
2. Run the screenshot test (`e2e/screenshot.spec.ts`)
3. Save screenshots to `e2e/screenshots/` directory

The screenshot test is automatically skipped during regular test runs (`npm run test:e2e:dev`).

**Note for agents**: Since the extension ID changes with each dev build, you cannot use the regular dev server for screenshots. Use `npm run screenshot` instead, which leverages the existing e2e test infrastructure.

## Extension Development

- WXT handles manifest generation and build process
- Development server runs on localhost:3000 with HMR
- Extension manifest includes `activeTab`, `tabs`, `scripting`, and `storage` permissions for page transformation and state persistence
- Built extension outputs to `.output/chrome-mv3/` directory
- Load the built extension in Chrome developer mode by selecting the output directory

## Code Quality

- Uses Biome for formatting and linting (configured in `biome.json`)
- Lefthook for pre-commit hooks that auto-format code
- TypeScript with strict configuration  
- Vitest for testing framework
- ls-lint enforces kebab-case file naming for TypeScript files
- TailwindCSS for styling with custom configuration

## Code Style Guidelines

- **Function Parameters**: When a function takes multiple parameters (2 or more), use a single object parameter with inline type definition instead. Single-parameter functions should keep their simple parameter style.

  ```typescript
  // Good: Multiple parameters as object
  export function interpolateKeyframes({
    keyframes,
    time,
    defaultValue,
  }: {
    keyframes: Keyframe[];
    time: RelativeTime;
    defaultValue: number;
  }): number {
    // ...
  }

  // Good: Single parameter stays simple
  export function getAnimationState(url: string): Promise<AnimationState | undefined> {
    // ...
  }

  // Bad: Multiple parameters without object
  export function interpolateKeyframes(
    keyframes: Keyframe[],
    time: RelativeTime,
    defaultValue: number,
  ): number {
    // ...
  }
  ```

## Directory Structure Guidelines

- **`src/lib/`**: Contains generic utility functions and libraries that are not application-specific. This directory should not contain any business logic specific to the browser extension.
- **`src/feature/`**: Contains application-specific business logic, feature implementations, and domain-specific utilities that are tailored to the extension's functionality.