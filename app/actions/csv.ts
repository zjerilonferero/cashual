"use server";

import { Effect } from "effect";
import { CsvParserService } from "@/app/lib/csv/service";
import { runtime } from "@/app/lib/csv/runtime";
import type { TransactionGroupResponseDTO } from "@/app/lib/transactions/schema";

/**
 * Server Action to parse CSV file containing transactions
 * Uses Effect-TS for composable, type-safe operations
 *
 * @param formData - Form data containing the file input
 * @returns Promise resolving to parsed transactions as plain objects (DTOs)
 */
export async function parseCsvAction(
  _: TransactionGroupResponseDTO | null,
  formData: FormData,
): Promise<TransactionGroupResponseDTO> {
  const file = formData.get("file") as File;
  const transactionGroupName = formData.get("transactionGroupName") as string;
  const content = await file.text();

  const program = Effect.gen(function* () {
    const service = yield* CsvParserService;
    return yield* service.parseTransactions(content, transactionGroupName);
  });

  return await runtime.runPromise(program);
}
