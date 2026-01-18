"use server";

import { Effect } from "effect";
import {
  CategoryRuleService,
  type CategoryRuleDTO,
} from "@/app/lib/category-rule";
import { runtime } from "@/app/lib/category";
import { revalidatePath } from "next/cache";

export async function getCategoryRules(): Promise<CategoryRuleDTO[]> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryRuleService;
    return yield* service.getAll();
  });

  return await runtime.runPromise(program);
}

export async function getCategoryRulesByCategoryId(
  categoryId: number,
): Promise<CategoryRuleDTO[]> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryRuleService;
    return yield* service.getByCategoryId(categoryId);
  });

  return await runtime.runPromise(program);
}

export async function createCategoryRule(
  categoryId: number,
  keywords: string[],
): Promise<CategoryRuleDTO> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryRuleService;
    return yield* service.create(categoryId, keywords);
  });

  revalidatePath("/");

  return await runtime.runPromise(program);
}

export async function updateCategoryRule(
  id: number,
  keywords: string[],
): Promise<CategoryRuleDTO> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryRuleService;
    return yield* service.update(id, keywords);
  });

  revalidatePath("/");

  return await runtime.runPromise(program);
}

export async function deleteCategoryRule(id: number): Promise<boolean> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryRuleService;
    return yield* service.delete(id);
  });

  revalidatePath("/");

  return await runtime.runPromise(program);
}
