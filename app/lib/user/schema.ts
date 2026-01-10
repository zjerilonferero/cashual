import { Data } from "effect";

export interface User {
  id: string;
  name: string;
  email: string;
}

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  message: string;
}> {}
