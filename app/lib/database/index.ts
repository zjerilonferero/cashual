import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { user } from "./schemas/auth-schema";
import { transaction } from "./schemas/transaction-schema";
import { transactionGroup } from "./schemas/transaction-group-schema";
import { Effect, Layer } from "effect";

export const db = drizzle(process.env.DB_FILE_NAME!, {
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
