import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";
import { systemCategory } from "./system-category-schema";

export const category = sqliteTable("category", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  systemCategoryId: integer("system_category_id").references(
    () => systemCategory.id,
    { onDelete: "set null" }
  ),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
