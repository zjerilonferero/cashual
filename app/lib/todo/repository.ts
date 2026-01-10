import { Effect, Layer } from "effect";
import { Todo } from "./schema";
import { TodoService, type TodoServiceInterface } from "./service";

/**
 * In-memory data store
 * Mock todos for demonstration purposes
 */
const MOCK_TODOS: Todo[] = [
  new Todo({ id: "1", title: "Learn Effect-TS", completed: false }),
  new Todo({ id: "2", title: "Build Todo App", completed: false }),
  new Todo({ id: "3", title: "Deploy to Production", completed: false }),
];

/**
 * TodoRepository Implementation
 * Provides TodoService using in-memory storage
 */
const make: TodoServiceInterface = {
  getTodos: Effect.succeed(MOCK_TODOS as readonly Todo[]),
};

/**
 * Live Layer for TodoService
 * Wire this into the runtime to provide TodoService
 */

export const TodoRepositoryLive = Layer.succeed(TodoService, make);

Effect.provideService(TodoService, make);
