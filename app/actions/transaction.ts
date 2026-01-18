"use server";

import { Effect } from "effect";
import { revalidatePath } from "next/cache";
import { TransactionGroupService } from "@/app/lib/transactions/service";
import { runtime } from "@/app/lib/transactions/runtime";

export async function updateTransactionCategory(
  transactionId: number,
  categoryId: number,
): Promise<boolean> {
  const program = Effect.gen(function* () {
    const service = yield* TransactionGroupService;
    return yield* service.updateTransactionCategory(transactionId, categoryId);
  });

  const result = await runtime.runPromise(program);
  revalidatePath("/statistics/groups");
  return result;
}

export async function updateTransactionCategoriesBatch(
  transactionIds: number[],
  categoryId: number,
): Promise<boolean> {
  const program = Effect.gen(function* () {
    const service = yield* TransactionGroupService;
    return yield* service.updateTransactionCategoryBatch(transactionIds, categoryId);
  });

  const result = await runtime.runPromise(program);
  revalidatePath("/statistics/groups");
  return result;
}
