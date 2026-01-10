import { DateTime, Effect, Layer, Option, Schema } from "effect";
import { parse } from "csv-parse/sync";
import { Transaction, CsvError } from "./schema";
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

function formatDateToDutch(dateStr: string): string {
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(4, 6), 10);
  const day = parseInt(dateStr.slice(6, 8), 10);

  const dateTime = DateTime.make({ year, month, day });

  if (Option.isNone(dateTime)) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return DateTime.format(dateTime.value, {
    locale: "nl-NL",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseEuropeanNumber(value: string): number {
  return parseFloat(value.replace(",", "."));
}

function mapTransactionType(debitCredit: string): "income" | "expense" {
  return debitCredit === "Credit" ? "income" : "expense";
}

type IngCsvRecord = Record<string, string>;

type MappedRecord = {
  date: string;
  name: string;
  amount: number;
  type: "income" | "expense";
};

const make: CsvParserServiceInterface = {
  parseTransactions: (content: string, transactionGroupName: string) =>
    Effect.gen(function* () {
      const userService = yield* UserService;
      const user = yield* userService.currentUser;

      const delimiter = detectDelimiter(content);

      const records = yield* Effect.try({
        try: () => {
          const transformRecord = (
            record: IngCsvRecord,
          ): MappedRecord | null => {
            if (record["Name / Description"].includes("Spaarrekening")) {
              return null;
            }
            return {
              date: formatDateToDutch(record["Date"]),
              name: record["Name / Description"],
              amount: parseEuropeanNumber(record["Amount (EUR)"]),
              type: mapTransactionType(record["Debit/credit"]),
            };
          };

          return parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            delimiter,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            on_record: transformRecord as any,
          }) as MappedRecord[];
        },
        catch: (error) =>
          new CsvError({
            message: `Failed to parse CSV: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      const validatedTransactions = yield* Effect.validateAll(
        records,
        (record, index) =>
          Schema.decodeUnknown(Transaction)(record).pipe(
            Effect.mapError((error) => {
              console.log(error);
              return `Row ${index + 1}: validation failed`;
            }),
          ),
      ).pipe(
        Effect.mapError(
          (errors) => new CsvError({ message: errors.join("\n") }),
        ),
      );

      // Create transaction group first
      const insertedGroup = yield* Effect.tryPromise({
        try: () =>
          db
            .insert(transactionGroup)
            .values({ userId: user.id, name: transactionGroupName })
            .returning({ id: transactionGroup.id }),
        catch: (error) =>
          new CsvError({
            message: `Failed to create transaction group: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      const groupId = insertedGroup[0].id;

      yield* Effect.tryPromise({
        try: () =>
          db.insert(transaction).values(
            validatedTransactions.map((validatedTransaction) => ({
              userId: user.id,
              groupId,
              name: validatedTransaction.name,
              date: validatedTransaction.date,
              amount: validatedTransaction.amount,
              type: validatedTransaction.type,
            })),
          ),
        catch: (error) =>
          new CsvError({
            message: `Failed to save transactions: ${error instanceof Error ? error.message : String(error)}`,
          }),
      });

      const transactionsDTO = yield* Effect.forEach(
        validatedTransactions,
        (validatedTransaction) =>
          Schema.encode(Transaction)(validatedTransaction),
      ).pipe(
        Effect.mapError(
          (error) =>
            new CsvError({
              message: `Encoding failed: ${error.message}`,
            }),
        ),
      );

      return {
        groupId,
        transactions: transactionsDTO,
        totalExpense: validatedTransactions
          .filter(
            (validatedTransaction) => validatedTransaction.type === "expense",
          )
          .reduce(
            (total, validatedTransaction) =>
              total + validatedTransaction.amount,
            0,
          ),
        totalIncome: validatedTransactions
          .filter(
            (validatedTransaction) => validatedTransaction.type === "income",
          )
          .reduce(
            (total, validatedTransaction) =>
              total + validatedTransaction.amount,
            0,
          ),
      };
    }),
};

export const CsvParserLive = Layer.succeed(CsvParserService, make);
