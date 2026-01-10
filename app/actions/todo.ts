"use server";

import { Effect } from "effect";
import { TodoService } from "@/app/lib/todo/service";
import { runtime } from "@/app/lib/todo/runtime";

/**
 * Server Action to get all todos
 * Uses Effect-TS for composable, type-safe operations
 */
export async function getTodos() {
  const program = Effect.gen(function* () {
    const service = yield* TodoService;
    const todos = yield* service.getTodos;
    return todos;
  });

  return await runtime.runPromise(program);
}
