import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { systemCategory } from "./system-category-schema";

export const systemCategoryRule = sqliteTable("system_category_rule", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  systemCategoryId: integer("system_category_id")
    .notNull()
    .references(() => systemCategory.id, { onDelete: "cascade" }),
  keywords: text("keywords", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});
