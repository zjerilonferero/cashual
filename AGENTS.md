# Agent Guidelines for Cashual

## Build Commands
- **Dev**: `bun dev` (starts Next.js dev server on :3000)
- **Build**: `bun run build` (production build)
- **Lint**: `bun run lint` (ESLint check)
- **Type Check**: `bunx tsc --noEmit`
- **Tests**: No test framework configured yet

## Code Style
- **Package Manager**: Use `bun` for all package operations
- **Imports**: Use named imports; `import type` for types; organize as: React/Next → external → internal
- **Path Aliases**: Use `@/*` for imports from project root (e.g., `@/app/components/Button`)
- **TypeScript**: Strict mode enabled; always provide explicit types for function params/returns
- **Components**: Functional components with TypeScript; use `export default function ComponentName()`
- **Naming**: camelCase (variables/functions), PascalCase (components/types), kebab-case (files/folders); no abbreviations in variable names (use `transaction` not `t`, `amount` not `amt`)
- **Formatting**: Double quotes for strings, semicolons, 2-space indentation
- **CSS**: Tailwind CSS v4 utility classes; use `className` prop
- **Error Handling**: Prefer error boundaries for React errors; explicit error types
- **Async**: Use async/await over promises; handle errors with try/catch

## Project Structure
- Next.js App Router (`app/` directory)
- Type-safe with TypeScript strict mode
- Tailwind CSS for styling with dark mode support

## Effect-TS Patterns
- **Schema**: Use `Schema.Class` for entity definitions with built-in validation
- **Services**: Define interface separately; use `Context.Tag` for dependency injection
- **Layers**: Implement services with `Layer.succeed()` or `Layer.effect()`; export as `*Live`
- **Runtime**: Create `ManagedRuntime` per domain; use `runtime.runPromise()` in Server Actions
- **Effects**: Use `Effect.gen` syntax for composing operations; `yield*` to unwrap values
- **Server Actions**: Mark with `"use server"`; run effects via runtime; return Promise for client
