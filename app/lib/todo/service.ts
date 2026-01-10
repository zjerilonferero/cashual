import { Context, Effect } from "effect";
import type { Todo } from "./schema";

/**
 * TodoService Interface
 * Defines the contract for Todo operations
 */
export interface TodoServiceInterface {
  readonly getTodos: Effect.Effect<readonly Todo[], never, never>;
}

/**
 * Context Tag for TodoService
 * Enables dependency injection in Effect programs
 */
export class TodoService extends Context.Tag("TodoService")<
  TodoService,
  TodoServiceInterface
>() {}
