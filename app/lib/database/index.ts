import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { user } from "./schemas/auth-schema";
import { transaction } from "./schemas/transaction-schema";
import { transactionGroup } from "./schemas/transaction-group-schema";
import { systemCategory } from "./schemas/system-category-schema";
import { systemCategoryRule } from "./schemas/system-category-rule-schema";
import { category } from "./schemas/category-schema";
import { categoryRule } from "./schemas/category-rule-schema";
import { Effect, Layer } from "effect";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? process.env.DB_FILE_NAME!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema: {
    user,
    transaction,
    transactionGroup,
    systemCategory,
    systemCategoryRule,
    category,
    categoryRule,
  },
});

export class DatabaseContext extends Effect.Service<DatabaseContext>()(
  "DatabaseContext",
  {
    effect: Effect.succeed({ db }),
  },
) {}

export const DatabaseLayer: Layer.Layer<DatabaseContext> =
  DatabaseContext.Default;
