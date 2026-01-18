import { Context, Effect } from "effect";
import type { CategoryRuleDTO, SystemCategoryRuleDTO } from "./schema";
import type { CategoryError } from "@/app/lib/category/schema";
import type { UnauthorizedError, UserService } from "@/app/lib/user";

export interface SystemCategoryRuleServiceInterface {
  readonly getAll: () => Effect.Effect<SystemCategoryRuleDTO[], CategoryError>;
}

export class SystemCategoryRuleService extends Context.Tag(
  "SystemCategoryRuleService",
)<SystemCategoryRuleService, SystemCategoryRuleServiceInterface>() {}

export interface CategoryRuleServiceInterface {
  readonly getAll: () => Effect.Effect<
    CategoryRuleDTO[],
    CategoryError | UnauthorizedError,
    UserService
  >;
  readonly getByCategoryId: (
    categoryId: number,
  ) => Effect.Effect<
    CategoryRuleDTO[],
    CategoryError | UnauthorizedError,
    UserService
  >;
  readonly create: (
    categoryId: number,
    keywords: string[],
  ) => Effect.Effect<CategoryRuleDTO, CategoryError | UnauthorizedError, UserService>;
  readonly update: (
    id: number,
    keywords: string[],
  ) => Effect.Effect<CategoryRuleDTO, CategoryError | UnauthorizedError, UserService>;
  readonly delete: (
    id: number,
  ) => Effect.Effect<boolean, CategoryError | UnauthorizedError, UserService>;
}

export class CategoryRuleService extends Context.Tag("CategoryRuleService")<
  CategoryRuleService,
  CategoryRuleServiceInterface
>() {}
