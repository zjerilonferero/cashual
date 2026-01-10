import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";
import { transactionGroup } from "./transaction-group-schema";

export const transaction = sqliteTable("transaction", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  groupId: integer("group_id")
    .notNull()
    .references(() => transactionGroup.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  date: text("date").notNull(),
  amount: integer("amount", { mode: "number" }).notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
});
