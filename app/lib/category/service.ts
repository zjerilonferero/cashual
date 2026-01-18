import { Context, Effect } from "effect";
import type { CategoryDTO, CategoryError, SystemCategoryDTO } from "./schema";
import type { UnauthorizedError, UserService } from "@/app/lib/user";

export interface SystemCategoryServiceInterface {
  readonly getAll: () => Effect.Effect<SystemCategoryDTO[], CategoryError>;
  readonly getDefault: () => Effect.Effect<SystemCategoryDTO, CategoryError>;
}

export class SystemCategoryService extends Context.Tag("SystemCategoryService")<
  SystemCategoryService,
  SystemCategoryServiceInterface
>() {}

export interface CategoryServiceInterface {
  readonly getAll: () => Effect.Effect<
    CategoryDTO[],
    CategoryError | UnauthorizedError,
    UserService
  >;
  readonly getById: (
    id: number,
  ) => Effect.Effect<
    CategoryDTO | null,
    CategoryError | UnauthorizedError,
    UserService
  >;
  readonly create: (
    data: Omit<CategoryDTO, "id" | "userId" | "createdAt">,
  ) => Effect.Effect<CategoryDTO, CategoryError | UnauthorizedError, UserService>;
  readonly update: (
    id: number,
    data: Partial<Omit<CategoryDTO, "id" | "userId" | "createdAt">>,
  ) => Effect.Effect<CategoryDTO, CategoryError | UnauthorizedError, UserService>;
  readonly delete: (
    id: number,
  ) => Effect.Effect<boolean, CategoryError | UnauthorizedError, UserService>;
  readonly getBySystemCategoryId: (
    systemCategoryId: number,
  ) => Effect.Effect<
    CategoryDTO | null,
    CategoryError | UnauthorizedError,
    UserService
  >;
  readonly getUncategorizedId: () => Effect.Effect<
    number,
    CategoryError | UnauthorizedError,
    UserService
  >;
}

export class CategoryService extends Context.Tag("CategoryService")<
  CategoryService,
  CategoryServiceInterface
>() {}

export interface CategorizationServiceInterface {
  readonly categorize: (
    transactionNames: string[],
  ) => Effect.Effect<number[], CategoryError | UnauthorizedError, UserService>;
  readonly extractKeywords: (
    transactionName: string,
  ) => Effect.Effect<string[], CategoryError>;
  readonly ensureUserHasCategories: () => Effect.Effect<
    void,
    CategoryError | UnauthorizedError,
    UserService
  >;
}

export class CategorizationService extends Context.Tag("CategorizationService")<
  CategorizationService,
  CategorizationServiceInterface
>() {}
