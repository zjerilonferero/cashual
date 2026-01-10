import { Context, Effect } from "effect";
import type { TransactionGroupDTO, TransactionGroupError } from "./schema";
import type { UnauthorizedError, UserService } from "@/app/lib/user";
import { TransactionResponseDTO } from "../csv/schema";

export interface TransactionGroupServiceInterface {
  readonly getAll: () => Effect.Effect<
    TransactionGroupDTO[],
    TransactionGroupError | UnauthorizedError,
    UserService
  >;
  readonly getById: (
    groupId: number,
  ) => Effect.Effect<
    TransactionResponseDTO,
    TransactionGroupError | UnauthorizedError,
    UserService
  >;
  readonly deleteTransactionByIds: (
    ids: number[],
  ) => Effect.Effect<boolean, TransactionGroupError, UserService>;
}

export class TransactionGroupService extends Context.Tag(
  "TransactionGroupService",
)<TransactionGroupService, TransactionGroupServiceInterface>() {}
