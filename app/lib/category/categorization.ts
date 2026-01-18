import { Effect, Layer } from "effect";
import {
  SystemCategoryService,
  CategoryService,
  CategorizationService,
  type CategorizationServiceInterface,
} from "./service";
import {
  SystemCategoryRuleService,
  CategoryRuleService,
} from "@/app/lib/category-rule";
import type { CategoryRuleDTO, SystemCategoryRuleDTO } from "@/app/lib/category-rule";

const CATEGORY_COLORS: Record<string, string> = {
  "Groceries": "#22c55e",
  "Utilities": "#f59e0b",
  "Mortgage/Rent": "#8b5cf6",
  "Income": "#10b981",
  "Dining Out": "#f43f5e",
  "Uncategorized": "#6b7280",
  "Transport": "#3b82f6",
  "Entertainment": "#ec4899",
  "Healthcare": "#14b8a6",
  "Shopping": "#a855f7",
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function byLongestKeyword(
  a: { keywords: readonly string[] },
  b: { keywords: readonly string[] },
): number {
  const aMax = Math.max(...a.keywords.map((k) => k.length));
  const bMax = Math.max(...b.keywords.map((k) => k.length));
  return bMax - aMax;
}

function matchCategory(
  transactionName: string,
  userRules: CategoryRuleDTO[],
  systemRules: SystemCategoryRuleDTO[],
  userCategoriesBySystemId: Map<number, number>,
  uncategorizedId: number,
): number {
  const name = transactionName.toLowerCase();

  const sortedUserRules = [...userRules].sort(byLongestKeyword);

  for (const rule of sortedUserRules) {
    const pattern = new RegExp(
      rule.keywords.map(escapeRegex).join("|"),
      "i",
    );
    if (pattern.test(name)) {
      return rule.categoryId;
    }
  }

  const sortedSystemRules = [...systemRules].sort(byLongestKeyword);

  for (const systemRule of sortedSystemRules) {
    const pattern = new RegExp(
      systemRule.keywords.map(escapeRegex).join("|"),
      "i",
    );
    if (pattern.test(name)) {
      const userCategoryId = userCategoriesBySystemId.get(
        systemRule.systemCategoryId,
      );
      if (userCategoryId !== undefined) {
        return userCategoryId;
      }
    }
  }

  return uncategorizedId;
}

const makeCategorizationService = Effect.gen(function* () {
  const systemCategoryService = yield* SystemCategoryService;
  const categoryService = yield* CategoryService;
  const systemCategoryRuleService = yield* SystemCategoryRuleService;
  const categoryRuleService = yield* CategoryRuleService;

  const service: CategorizationServiceInterface = {
    categorize: (transactionNames: string[]) =>
      Effect.gen(function* () {
        const userRules = yield* categoryRuleService.getAll();
        const systemRules = yield* systemCategoryRuleService.getAll();
        const userCategories = yield* categoryService.getAll();
        const uncategorizedId = yield* categoryService.getUncategorizedId();

        const userCategoriesBySystemId = new Map(
          userCategories
            .filter((c) => c.systemCategoryId !== null)
            .map((c) => [c.systemCategoryId!, c.id]),
        );

        return transactionNames.map((name) =>
          matchCategory(
            name,
            userRules,
            systemRules,
            userCategoriesBySystemId,
            uncategorizedId,
          ),
        );
      }),

    extractKeywords: (transactionName: string) =>
      Effect.gen(function* () {
        const words = transactionName.trim().split(/\s+/);
        const suggestions: string[] = [];

        for (let i = Math.min(3, words.length); i >= 1; i--) {
          suggestions.push(words.slice(0, i).join(" "));
        }

        return [...new Set(suggestions)];
      }),

    ensureUserHasCategories: () =>
      Effect.gen(function* () {
        const existingCategories = yield* categoryService.getAll();

        if (existingCategories.length > 0) {
          return;
        }

        const systemCategories = yield* systemCategoryService.getAll();

        for (const sysCategory of systemCategories) {
          const color = CATEGORY_COLORS[sysCategory.name] ?? "#6b7280";
          yield* categoryService.create({
            systemCategoryId: sysCategory.id,
            name: sysCategory.name,
            icon: sysCategory.icon,
            color,
          });
        }
      }),
  };

  return service;
});

export const CategorizationLive = Layer.effect(
  CategorizationService,
  makeCategorizationService,
);
