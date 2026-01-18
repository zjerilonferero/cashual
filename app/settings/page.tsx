import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { getCategories } from "@/app/actions/category";
import { getCategoryRules } from "@/app/actions/category-rule";
import { CategoriesManager } from "./categories-manager";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [categories, rules] = await Promise.all([
    getCategories(),
    getCategoryRules(),
  ]);

  const categoriesWithRules = categories.map((category) => ({
    ...category,
    rules: rules.filter((rule) => rule.categoryId === category.id),
  }));

  return (
    <div className="flex-1 flex flex-col px-6 py-6 max-w-full">
      <div className="w-full flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your categories and auto-categorization rules
          </p>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Categories</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {categories.length} categories
            </span>
          </div>

          <CategoriesManager categoriesWithRules={categoriesWithRules} />
        </section>
      </div>
    </div>
  );
}
