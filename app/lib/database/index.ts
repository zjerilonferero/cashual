import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { user } from "./schemas/auth-schema";
import { transaction } from "./schemas/transaction-schema";
import { transactionGroup } from "./schemas/transaction-group-schema";
import { Effect, Layer } from "effect";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? process.env.DB_FILE_NAME!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, {
  schema: { user, transaction, transactionGroup },
});

export class DatabaseContext extends Effect.Service<DatabaseContext>()(
  "DatabaseContext",
  {
    effect: Effect.succeed({ db }),
  },
) {}

export const DatabaseLayer: Layer.Layer<DatabaseContext> =
  DatabaseContext.Default;
