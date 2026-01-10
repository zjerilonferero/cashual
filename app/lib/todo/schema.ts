import { Schema } from "effect";

/**
 * Todo Schema Definition
 * Defines validation rules for Todo entities
 */
export class Todo extends Schema.Class<Todo>("Todo")({
  id: Schema.String.pipe(Schema.nonEmptyString()),
  title: Schema.String.pipe(Schema.nonEmptyString(), Schema.maxLength(200)),
  completed: Schema.Boolean,
}) {}

/**
 * Derived type for use in function signatures
 */
export type TodoType = typeof Todo.Type;
