import { Context, Effect } from "effect";
import type { User, UnauthorizedError } from "./schema";

export interface UserServiceInterface {
  readonly currentUser: Effect.Effect<User, UnauthorizedError>;
}

export class UserService extends Context.Tag("UserService")<
  UserService,
  UserServiceInterface
>() {}
