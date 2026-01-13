import { Effect, Layer } from "effect";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/app/lib/database";
import { transactionGroup } from "@/app/lib/database/schemas/transaction-group-schema";
import { transaction } from "@/app/lib/database/schemas/transaction-schema";
import { UserService } from "@/app/lib/user";
import {
  TransactionGroupService,
  type TransactionGroupServiceInterface,
} from "./service";
import { TransactionGroupError } from "./schema";

const make: TransactionGroupServiceInterface = {
  getAll: () =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const groups = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              id: transactionGroup.id,
              createdAt: transactionGroup.createdAt,
              name: transactionGroup.name,
              totalIncome: sql<number>`coalesce(sum(case when ${transaction.type} = 'income' then ${transaction.amount} else 0 end), 0)`,
              totalExpense: sql<number>`coalesce(sum(case when ${transaction.type} = 'expense' then ${transaction.amount} else 0 end), 0)`,
            })
            .from(transactionGroup)
            .leftJoin(transaction, eq(transaction.groupId, transactionGroup.id))
            .where(eq(transactionGroup.userId, user.id))
            .groupBy(transactionGroup.id)
            .orderBy(transactionGroup.createdAt),
        catch: (error) =>
          new TransactionGroupError({
            message: `Failed to fetch transaction groups: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return groups;
    }),

  getById: (groupId: number) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const group = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              id: transactionGroup.id,
              createdAt: transactionGroup.createdAt,
              name: transactionGroup.name,
            })
            .from(transactionGroup)
            .where(eq(transactionGroup.id, groupId))
            .limit(1),
        catch: (error) =>
          new TransactionGroupError({
            message: `Failed to fetch transaction group: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (group.length === 0) {
        return yield* Effect.fail(
          new TransactionGroupError({ message: "Transaction group not found" }),
        );
      }

      const groupData = group[0];

      // Verify the group belongs to the current user
      const groupWithUser = yield* Effect.tryPromise({
        try: () =>
          db
            .select({ userId: transactionGroup.userId })
            .from(transactionGroup)
            .where(eq(transactionGroup.id, groupId))
            .limit(1),
        catch: (error) =>
          new TransactionGroupError({
            message: `Failed to verify group ownership: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      if (groupWithUser[0]?.userId !== user.id) {
        return yield* Effect.fail(
          new TransactionGroupError({ message: "Transaction group not found" }),
        );
      }

      const transactions = yield* Effect.tryPromise({
        try: () =>
          db
            .select({
              id: transaction.id,
              name: transaction.name,
              date: transaction.date,
              amount: transaction.amount,
              type: transaction.type,
            })
            .from(transaction)
            .where(eq(transaction.groupId, groupId)),
        catch: (error) =>
          new TransactionGroupError({
            message: `Failed to fetch transactions: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        groupId: groupData.id,
        createdAt: groupData.createdAt,
        name: groupData.name,
        transactions,
        totalIncome,
        totalExpense,
      };
    }),

  deleteTransactionByIds: (ids: number[]) => {
    return Effect.gen(function* () {
      yield* Effect.tryPromise({
        try: () => {
          return db.delete(transaction).where(inArray(transaction.id, ids));
        },
        catch(error) {
          return new TransactionGroupError({ message: String(error) });
        },
      });
      return true;
    });
  },
};

export const TransactionGroupLive = Layer.succeed(
  TransactionGroupService,
  make,
);
