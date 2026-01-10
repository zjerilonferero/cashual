import { Context, Effect } from "effect";
import type { CsvError, TransactionResponseDTO } from "./schema";
import type { UnauthorizedError, UserService } from "@/app/lib/user";

/**
 * CsvParserService Interface
 * Defines the contract for CSV parsing operations
 */
export interface CsvParserServiceInterface {
  readonly parseTransactions: (
    content: string,
    transactionGroupName: string,
  ) => Effect.Effect<
    TransactionResponseDTO,
    CsvError | UnauthorizedError,
    UserService
  >;
}

/**
 * Context Tag for CsvParserService
 * Enables dependency injection in Effect programs
 */
export class CsvParserService extends Context.Tag("CsvParserService")<
  CsvParserService,
  CsvParserServiceInterface
>() {}
