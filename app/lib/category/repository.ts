import { Effect, Layer } from "effect";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/lib/database";
import { systemCategory } from "@/app/lib/database/schemas/system-category-schema";
import { category } from "@/app/lib/database/schemas/category-schema";
import { transaction } from "@/app/lib/database/schemas/transaction-schema";
import { UserService } from "@/app/lib/user";
import { CategoryError } from "./schema";
import type { CategoryDTO, SystemCategoryDTO } from "./schema";
import type {
  SystemCategoryServiceInterface,
  CategoryServiceInterface,
} from "./service";
import { SystemCategoryService, CategoryService } from "./service";

const makeSystemCategoryService: SystemCategoryServiceInterface = {
  getAll: () =>
    Effect.tryPromise({
      try: () => db.select().from(systemCategory),
      catch: (error) =>
        new CategoryError({
          message: `Failed to fetch system categories: ${error instanceof Error ? error.message : String(error)}`,
        }),
    }),

  getDefault: () =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(systemCategory)
            .where(eq(systemCategory.isDefault, true))
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch default system category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (result.length === 0) {
        return yield* Effect.fail(
          new CategoryError({ message: "Default system category not found" }),
        );
      }

      return result[0] as SystemCategoryDTO;
    }),
};

export const SystemCategoryLive = Layer.succeed(
  SystemCategoryService,
  makeSystemCategoryService,
);

const makeCategoryService: CategoryServiceInterface = {
  getAll: () =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const result = yield* Effect.tryPromise({
        try: () =>
          db.select().from(category).where(eq(category.userId, user.id)),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch categories: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return result as CategoryDTO[];
    }),

  getById: (id: number) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(category)
            .where(and(eq(category.id, id), eq(category.userId, user.id)))
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (result.length === 0) {
        return null;
      }

      return result[0] as CategoryDTO;
    }),

  create: (data) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .insert(category)
            .values({
              userId: user.id,
              name: data.name,
              icon: data.icon,
              color: data.color,
              systemCategoryId: data.systemCategoryId,
            })
            .returning(),
        catch: (error) =>
          new CategoryError({
            message: `Failed to create category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return result[0] as CategoryDTO;
    }),

  update: (id, data) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const existing = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(category)
            .where(and(eq(category.id, id), eq(category.userId, user.id)))
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (existing.length === 0) {
        return yield* Effect.fail(
          new CategoryError({ message: "Category not found" }),
        );
      }

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .update(category)
            .set({
              ...(data.name !== undefined && { name: data.name }),
              ...(data.icon !== undefined && { icon: data.icon }),
              ...(data.color !== undefined && { color: data.color }),
              ...(data.systemCategoryId !== undefined && {
                systemCategoryId: data.systemCategoryId,
              }),
            })
            .where(eq(category.id, id))
            .returning(),
        catch: (error) =>
          new CategoryError({
            message: `Failed to update category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return result[0] as CategoryDTO;
    }),

  delete: (id) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const existing = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(category)
            .where(and(eq(category.id, id), eq(category.userId, user.id)))
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (existing.length === 0) {
        return yield* Effect.fail(
          new CategoryError({ message: "Category not found" }),
        );
      }

      if (existing[0].systemCategoryId) {
        const systemCat = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(systemCategory)
              .where(eq(systemCategory.id, existing[0].systemCategoryId!))
              .limit(1),
          catch: (error) =>
            new CategoryError({
              message: `Failed to fetch system category: ${error instanceof Error ? error.message : String(error)}`,
            }),
        });

        if (systemCat.length > 0 && systemCat[0].isDefault) {
          return yield* Effect.fail(
            new CategoryError({
              message: "Cannot delete the fallback category",
            }),
          );
        }
      }

      const uncategorizedId = yield* makeCategoryService.getUncategorizedId();

      yield* Effect.tryPromise({
        try: () =>
          db
            .update(transaction)
            .set({ categoryId: uncategorizedId })
            .where(eq(transaction.categoryId, id)),
        catch: (error) =>
          new CategoryError({
            message: `Failed to reassign transactions: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      yield* Effect.tryPromise({
        try: () => db.delete(category).where(eq(category.id, id)),
        catch: (error) =>
          new CategoryError({
            message: `Failed to delete category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return true;
    }),

  getBySystemCategoryId: (systemCategoryId: number) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const result = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(category)
            .where(
              and(
                eq(category.userId, user.id),
                eq(category.systemCategoryId, systemCategoryId),
              ),
            )
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch category by system category ID: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (result.length === 0) {
        return null;
      }

      return result[0] as CategoryDTO;
    }),

  getUncategorizedId: () =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const defaultSystemCat = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(systemCategory)
            .where(eq(systemCategory.isDefault, true))
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch default system category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (defaultSystemCat.length === 0) {
        return yield* Effect.fail(
          new CategoryError({ message: "Default system category not found" }),
        );
      }

      const userCat = yield* Effect.tryPromise({
        try: () =>
          db
            .select()
            .from(category)
            .where(
              and(
                eq(category.userId, user.id),
                eq(category.systemCategoryId, defaultSystemCat[0].id),
              ),
            )
            .limit(1),
        catch: (error) =>
          new CategoryError({
            message: `Failed to fetch uncategorized category: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (userCat.length === 0) {
        return yield* Effect.fail(
          new CategoryError({
            message: "User's uncategorized category not found",
          }),
        );
      }

      return userCat[0].id;
    }),
};

export const CategoryLive = Layer.succeed(CategoryService, makeCategoryService);
