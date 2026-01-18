"use server";

import { Effect } from "effect";
import { CsvParserService } from "@/app/lib/csv/service";
import { CategorizationService } from "@/app/lib/category";
import { runtime } from "@/app/lib/csv/runtime";
import type { CsvParseResultDTO } from "@/app/lib/csv/schema";

export async function parseCsvAction(
  _: CsvParseResultDTO | null,
  formData: FormData,
): Promise<CsvParseResultDTO> {
  const file = formData.get("file") as File;
  const transactionGroupName = formData.get("transactionGroupName") as string;
  const content = await file.text();

  const program = Effect.gen(function* () {
    const categorizationService = yield* CategorizationService;
    yield* categorizationService.ensureUserHasCategories();

    const csvService = yield* CsvParserService;
    return yield* csvService.parseTransactions(content, transactionGroupName);
  });

  return await runtime.runPromise(program);
}
