import { Effect, Layer, ManagedRuntime } from "effect";
import { DatabaseContext, DatabaseLayer } from "./database";

/**
 * Combine all layers for the Todo domain
 * Add more layers here as the application grows
 */
const MainLayer = Layer.mergeAll(DatabaseLayer);

/**
 * Managed runtime for Todo domain
 * Handles resource lifecycle and dependency injection
 */
export const runtime = ManagedRuntime.make(MainLayer);

/**
 * Helper function to run effects and convert to Promise
 * Use this in Server Actions and API routes
 */
export const runEffect = <A, E>(effect: Effect.Effect<A, E>) =>
  runtime.runPromise(effect);

Effect.gen(function* () {
  const db = yield* DatabaseContext;
});
