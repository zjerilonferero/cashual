"use server";

import { Effect } from "effect";
import {
  CategoryService,
  CategorizationService,
  runtime,
  type CategoryDTO,
} from "@/app/lib/category";
import { revalidatePath } from "next/cache";

export async function getCategories(): Promise<CategoryDTO[]> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryService;
    return yield* service.getAll();
  });

  return await runtime.runPromise(program);
}

export async function getCategoryById(id: number): Promise<CategoryDTO | null> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryService;
    return yield* service.getById(id);
  });

  return await runtime.runPromise(program);
}

export async function createCategory(data: {
  name: string;
  icon?: string | null;
  color?: string | null;
}): Promise<CategoryDTO> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryService;
    return yield* service.create({
      name: data.name,
      icon: data.icon ?? null,
      color: data.color ?? null,
      systemCategoryId: null,
    });
  });

  revalidatePath("/");

  return await runtime.runPromise(program);
}

export async function updateCategory(
  id: number,
  data: {
    name?: string;
    icon?: string | null;
    color?: string | null;
  },
): Promise<CategoryDTO> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryService;
    return yield* service.update(id, data);
  });

  revalidatePath("/");

  return await runtime.runPromise(program);
}

export async function deleteCategory(id: number): Promise<boolean> {
  const program = Effect.gen(function* () {
    const service = yield* CategoryService;
    return yield* service.delete(id);
  });

  revalidatePath("/");

  return await runtime.runPromise(program);
}

export async function ensureUserHasCategories(): Promise<void> {
  const program = Effect.gen(function* () {
    const service = yield* CategorizationService;
    return yield* service.ensureUserHasCategories();
  });

  return await runtime.runPromise(program);
}
