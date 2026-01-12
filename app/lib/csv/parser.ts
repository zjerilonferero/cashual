import { Effect, Layer, Schema } from "effect";
import { parse } from "csv-parse/sync";
import { CsvError, CsvTransaction } from "./schema";
import { CsvParserService, type CsvParserServiceInterface } from "./service";
import { db } from "@/app/lib/database";
import { transaction } from "@/app/lib/database/schemas/transaction-schema";
import { transactionGroup } from "@/app/lib/database/schemas/transaction-group-schema";
import { UserService } from "@/app/lib/user";

function detectDelimiter(content: string): string {
  const firstLine = content.split("\n")[0] ?? "";
  const delimiters = [",", ";", "\t"];

  let bestDelimiter = ",";
  let maxCount = 0;

  for (const delimiter of delimiters) {
    const count = (firstLine.match(new RegExp(delimiter, "g")) ?? []).length;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

const make: CsvParserServiceInterface = {
  parseTransactions: (content: string, transactionGroupName: string) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const delimiter = detectDelimiter(content);

      // Parse CSV to raw records
      const rawRecords = yield* Effect.try({
        try: () =>
          parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            delimiter,
          }) as Record<string, string>[],
        catch: (error) =>
          new CsvError({
            message: `Failed to parse CSV: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      // Filter out Spaarrekening records
      const filteredRecords = rawRecords.filter(
        (record) => !record["Name / Description"]?.includes("Spaarrekening")
      );

      // Decode using Effect Schema transformations
      const validatedTransactions = yield* Effect.validateAll(
        filteredRecords,
        (record, index) =>
          Schema.decodeUnknown(CsvTransaction)(record).pipe(
            Effect.mapError((error) => `Row ${index + 1}: ${error.message}`),
          ),
      ).pipe(
        Effect.mapError(
          (errors) => new CsvError({ message: errors.join("\n") }),
        ),
      );

      // Create transaction group
      const insertedGroup = yield* Effect.tryPromise({
        try: () =>
          db
            .insert(transactionGroup)
            .values({ userId: user.id, name: transactionGroupName })
            .returning({
              id: transactionGroup.id,
              createdAt: transactionGroup.createdAt,
              name: transactionGroup.name,
            }),
        catch: (error) =>
          new CsvError({
            message: `Failed to create transaction group: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      const group = insertedGroup[0];

      // Insert transactions and get them back with IDs
      const insertedTransactions = yield* Effect.tryPromise({
        try: () =>
          db
            .insert(transaction)
            .values(
              validatedTransactions.map((validatedTransaction) => ({
                userId: user.id,
                groupId: group.id,
                name: validatedTransaction.name,
                date: validatedTransaction.date,
                amount: validatedTransaction.amount,
                type: validatedTransaction.type,
              })),
            )
            .returning({
              id: transaction.id,
              name: transaction.name,
              date: transaction.date,
              amount: transaction.amount,
              type: transaction.type,
            }),
        catch: (error) =>
          new CsvError({
            message: `Failed to save transactions: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      return {
        groupId: group.id,
        createdAt: group.createdAt,
        name: group.name,
        transactions: insertedTransactions,
        totalExpense: insertedTransactions
          .filter((insertedTransaction) => insertedTransaction.type === "expense")
          .reduce((total, insertedTransaction) => total + insertedTransaction.amount, 0),
        totalIncome: insertedTransactions
          .filter((insertedTransaction) => insertedTransaction.type === "income")
          .reduce((total, insertedTransaction) => total + insertedTransaction.amount, 0),
      };
    }),
};

export const CsvParserLive = Layer.succeed(CsvParserService, make);
