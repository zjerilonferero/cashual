import { Data, DateTime, Option, ParseResult, Schema } from "effect";
import { TransactionTypeSchema } from "@/app/lib/transactions/schema";

export class CsvError extends Data.TaggedError("CsvError")<{
  message: string;
}> {}

// European number format: "1234,56" → 1234.56
const EuropeanNumber = Schema.transform(
  Schema.String,
  Schema.Number,
  {
    decode: (value) => parseFloat(value.replace(",", ".")),
    encode: (value) =>
      new Intl.NumberFormat("nl-NL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value),
  }
);

// Date format: "20240115" → "15 jan 2024"
const FormattedDate = Schema.transformOrFail(
  Schema.String,
  Schema.String,
  {
    decode: (dateString, _, ast) => {
      const year = parseInt(dateString.slice(0, 4), 10);
      const month = parseInt(dateString.slice(4, 6), 10);
      const day = parseInt(dateString.slice(6, 8), 10);
      const dateTime = DateTime.make({ year, month, day });

      if (Option.isNone(dateTime)) {
        return ParseResult.fail(
          new ParseResult.Type(ast, dateString, "Invalid date format")
        );
      }

      return ParseResult.succeed(
        DateTime.format(dateTime.value, {
          locale: "nl-NL",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    },
    encode: (formatted) => ParseResult.succeed(formatted),
  }
);

// Debit/Credit → income/expense
const TransactionTypeFromCsv = Schema.transform(
  Schema.String,
  TransactionTypeSchema,
  {
    decode: (value) => (value === "Credit" ? "income" : "expense"),
    encode: (value) => (value === "income" ? "Credit" : "Debit"),
  }
);

// Raw CSV record with field transformations applied
const CsvRecord = Schema.Struct({
  "Date": FormattedDate,
  "Name / Description": Schema.String,
  "Amount (EUR)": EuropeanNumber,
  "Debit/credit": TransactionTypeFromCsv,
});

// Parsed CSV transaction (without id or category - these are added during insert)
const TransactionFromCsv = Schema.Struct({
  date: Schema.String,
  name: Schema.String,
  amount: Schema.Number,
  type: TransactionTypeSchema,
});

// Transform CSV field names to Transaction field names
export const CsvTransaction = Schema.transform(
  CsvRecord,
  TransactionFromCsv,
  {
    decode: (csvRecord) => ({
      date: csvRecord["Date"],
      name: csvRecord["Name / Description"],
      amount: csvRecord["Amount (EUR)"],
      type: csvRecord["Debit/credit"],
    }),
    encode: (transaction) => ({
      "Date": transaction.date,
      "Name / Description": transaction.name,
      "Amount (EUR)": transaction.amount,
      "Debit/credit": transaction.type,
    }),
  }
);

export type CsvTransactionDTO = typeof TransactionFromCsv.Encoded;

// Response from CSV parsing (simplified - page will re-fetch with JOINs)
export class CsvParseResult extends Schema.Class<CsvParseResult>("CsvParseResult")({
  groupId: Schema.Number,
  name: Schema.String,
  createdAt: Schema.DateFromSelf,
  transactionCount: Schema.Number,
  totalIncome: Schema.Number,
  totalExpense: Schema.Number,
}) {}

export type CsvParseResultDTO = typeof CsvParseResult.Encoded;
