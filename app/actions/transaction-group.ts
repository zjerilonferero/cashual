"use server";

import { Effect } from "effect";
import { TransactionGroupService } from "@/app/lib/transactions/service";
import { runtime } from "@/app/lib/transactions/runtime";
import type { TransactionGroupDTO } from "@/app/lib/transactions/schema";
import { TransactionResponseDTO } from "../lib/csv/schema";
import { revalidatePath } from "next/cache";

export async function getTransactionGroups(): Promise<TransactionGroupDTO[]> {
  const program = Effect.gen(function* () {
    const service = yield* TransactionGroupService;
    return yield* service.getAll();
  });

  return await runtime.runPromise(program);
}

export async function getTransactionGroupById(
  groupId: number,
): Promise<TransactionResponseDTO> {
  const program = Effect.gen(function* () {
    const service = yield* TransactionGroupService;
    return yield* service.getById(groupId);
  });

  return await runtime.runPromise(program);
}

export async function deleteTransactionByIds(ids: number[]): Promise<boolean> {
  const program = Effect.gen(function* () {
    const service = yield* TransactionGroupService;
    return yield* service.deleteTransactionByIds(ids);
  });

  revalidatePath("/statistics/group");

  return await runtime.runPromise(program);
}
