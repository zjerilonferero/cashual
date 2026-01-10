import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL ?? process.env.DB_FILE_NAME!;
const authToken = process.env.TURSO_AUTH_TOKEN;
const dialect = process.env.TURSO_DATABASE_URL ? "turso" : "sqlite";

export default defineConfig({
  out: "./drizzle",
  schema: "./app/lib/database/schemas/*.ts",
  dialect,
  dbCredentials: {
    url,
    authToken: authToken,
  },
});
