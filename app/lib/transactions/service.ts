import { Context, Effect } from "effect";
import type {
  TransactionGroupError,
  TransactionGroupResponseDTO,
  TransactionGroupSummaryDTO,
} from "./schema";
import type { UnauthorizedError, UserService } from "@/app/lib/user";

export interface TransactionGroupServiceInterface {
  readonly getAll: () => Effect.Effect<
    TransactionGroupSummaryDTO[],
    TransactionGroupError | UnauthorizedError,
    UserService
  >;
  readonly getById: (
    groupId: number,
  ) => Effect.Effect<
    TransactionGroupResponseDTO,
    TransactionGroupError | UnauthorizedError,
    UserService
  >;
  readonly deleteTransactionByIds: (
    ids: number[],
  ) => Effect.Effect<boolean, TransactionGroupError, UserService>;
  readonly deleteTransactionGroupById: (
    id: number,
  ) => Effect.Effect<boolean, TransactionGroupError, UserService>;
  readonly updateTransactionCategory: (
    transactionId: number,
    categoryId: number,
  ) => Effect.Effect<boolean, TransactionGroupError | UnauthorizedError, UserService>;
  readonly updateTransactionCategoryBatch: (
    transactionIds: number[],
    categoryId: number,
  ) => Effect.Effect<boolean, TransactionGroupError | UnauthorizedError, UserService>;
}

export class TransactionGroupService extends Context.Tag(
  "TransactionGroupService",
)<TransactionGroupService, TransactionGroupServiceInterface>() {}
