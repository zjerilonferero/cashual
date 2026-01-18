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
- **Naming**: camelCase (variables/functions), PascalCase (components/types), kebab-case (files/folders); no abbreviations in variable names (use `transaction` not `t`, `amount` not `amt`, `validatedTransaction` not `tx`)
- **Formatting**: Double quotes for strings, semicolons, 2-space indentation
- **CSS**: Tailwind CSS v4 utility classes; use `className` prop
- **Error Handling**: Prefer error boundaries for React errors; explicit error types
- **Async**: Use async/await over promises; handle errors with try/catch
- **Comments**: Avoid comments in code; code should be self-documenting through clear naming

## Project Structure
- Next.js App Router (`app/` directory)
- Type-safe with TypeScript strict mode
- Tailwind CSS for styling with dark mode support

## Effect-TS Patterns
- **Schema.Class**: Use for domain entities with built-in validation, equality, and hashing
- **Schema.Struct**: Use for transient/intermediate data (e.g., CSV parsing) that doesn't need class features
- **Schema Transformations**: Use `Schema.transform` or `Schema.transformOrFail` for data transformations; define both decode and encode functions
- **Schema Omit**: Use `Transaction.pipe(Schema.omit("id"))` to derive schemas with fields removed; prefer over separate type definitions
- **Services**: Define interface separately; use `Context.Tag` for dependency injection
- **Layers**: Implement services with `Layer.succeed()` or `Layer.effect()`; export as `*Live`
- **Runtime**: Create `ManagedRuntime` per domain; use `runtime.runPromise()` in Server Actions
- **Effects**: Use `Effect.gen` syntax for composing operations; `yield*` to unwrap values
- **Server Actions**: Mark with `"use server"`; run effects via runtime; return Promise for client
- **Date/Time**: Use Effect's `DateTime` module for date parsing and formatting
- **Errors**: Use `Data.TaggedError` for domain-specific errors

## Schema Types (`app/lib/transactions/schema.ts`)
- **Transaction**: Core entity with required `id`; defined as `Schema.Class`
- **TransactionDTO**: Encoded type derived from Transaction (`typeof Transaction.Encoded`)
- **TransactionGroupResponse**: Full response with transactions, totals, and metadata
- **TransactionGroupSummary**: Lightweight response for listing groups (without transactions)
- **Derive without id**: Use `Transaction.pipe(Schema.omit("id"))` for parsing input that doesn't have an id yet

## CSV Parsing (`app/lib/csv/`)
- **Schema Transformations**: Define field transformations as reusable schemas (e.g., `EuropeanNumber`, `FormattedDate`, `TransactionTypeFromCsv`)
- **CsvTransaction**: Transforms raw CSV record to `Omit<TransactionDTO, "id">` using `Schema.transform`
- **Filtering**: Filter records before decoding (e.g., exclude "Spaarrekening" records)
- **Validation**: Use `Effect.validateAll` with `Schema.decodeUnknown` for batch validation with error accumulation
- **Number Formatting**: Use `Intl.NumberFormat` for encoding localized numbers; manual parsing for decoding European format
- **Date Formatting**: Use Effect's `DateTime.make` and `DateTime.format` for date transformations
