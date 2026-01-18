import { Context, Effect } from "effect";
import type { CsvError, CsvParseResultDTO } from "./schema";
import type { UnauthorizedError, UserService } from "@/app/lib/user";
import type { CategoryError, CategorizationService } from "@/app/lib/category";

export interface CsvParserServiceInterface {
  readonly parseTransactions: (
    content: string,
    transactionGroupName: string,
  ) => Effect.Effect<
    CsvParseResultDTO,
    CsvError | UnauthorizedError | CategoryError,
    UserService | CategorizationService
  >;
}

export class CsvParserService extends Context.Tag("CsvParserService")<
  CsvParserService,
  CsvParserServiceInterface
>() {}
