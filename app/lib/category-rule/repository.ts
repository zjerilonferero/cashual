import { Effect, Layer } from "effect";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/lib/database";
import { systemCategoryRule } from "@/app/lib/database/schemas/system-category-rule-schema";
import { categoryRule } from "@/app/lib/database/schemas/category-rule-schema";
import { UserService } from "@/app/lib/user";
import { CategoryError } from "@/app/lib/category/schema";
import type { CategoryRuleDTO, SystemCategoryRuleDTO } from "./schema";
import type {
  SystemCategoryRuleServiceInterface,
  CategoryRuleServiceInterface,
} from "./service";
import { SystemCategoryRuleService, CategoryRuleService } from "./service";

const makeSystemCategoryRuleService: SystemCategoryRuleServiceInterface = {
  getAll: () =>
    Effect.tryPromise({
      try: () => db.select().from(systemCategoryRule),
      catch: (error) =>
        new CategoryError({
          message: `Failed to fetch system category rules: ${error instanceof Error ? error.message : String(error)}`,
        }),
    }) as Effect.Effect<SystemCategoryRuleDTO[], CategoryError>,
};

export const SystemCategoryRuleLive = Layer.succeed(
  SystemCategoryRuleService,
  makeSystemCategoryRuleService,
);

const makeCategoryRuleService: CategoryRuleServiceInterface = {
  getAll: () =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(categoryRule)
            .where(eq(categoryRule.userId, user.id)),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch category rules: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return result as CategoryRuleDTO[];
    }),

  getByCategoryId: (categoryId: number) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(categoryRule)
            .where(
              and(
                eq(categoryRule.userId, user.id),
                eq(categoryRule.categoryId, categoryId),
              ),
            ),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch category rules: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return result as CategoryRuleDTO[];
    }),

  create: (categoryId: number, keywords: string[]) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .insert(categoryRule)
            .values({
              userId: user.id,
              categoryId,
              keywords,
            })
            .returning(),
        catch: (error) =>
          new CategoryError({
            message: `Failed to create category rule: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return result[0] as CategoryRuleDTO;
    }),

  update: (id: number, keywords: string[]) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const existing = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(categoryRule)
            .where(and(eq(categoryRule.id, id), eq(categoryRule.userId, user.id)))
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch category rule: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (existing.length === 0) {
        return yield* Effect.fail(
          new CategoryError({ message: "Category rule not found" }),
        );
      }

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .update(categoryRule)
            .set({ keywords })
            .where(eq(categoryRule.id, id))
            .returning(),
        catch: (error) =>
          new CategoryError({
            message: `Failed to update category rule: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return result[0] as CategoryRuleDTO;
    }),

  delete: (id: number) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const existing = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(categoryRule)
            .where(and(eq(categoryRule.id, id), eq(categoryRule.userId, user.id)))
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch category rule: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (existing.length === 0) {
        return yield* Effect.fail(
          new CategoryError({ message: "Category rule not found" }),
        );
      }

      yield* Effect.tryPromise({
        try: () => db.delete(categoryRule).where(eq(categoryRule.id, id)),
        catch: (error) =>
          new CategoryError({
            message: `Failed to delete category rule: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return true;
    }),
};

export const CategoryRuleLive = Layer.succeed(
  CategoryRuleService,
  makeCategoryRuleService,
);
