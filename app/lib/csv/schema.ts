import { Data, Schema } from "effect";

export const TransactionTypeSchema = Schema.Literal("income", "expense");

export class Transaction extends Schema.Class<Transaction>("Transaction")({
  date: Schema.String,
  name: Schema.String,
  amount: Schema.Number,
  type: TransactionTypeSchema,
  id: Schema.Number,
}) {}

export type TransactionType = typeof Transaction.Type;

export type TransactionDTO = typeof Transaction.Encoded;

export type TransactionResponseDTO = {
  groupId: number;
  totalExpense: number;
  totalIncome: number;
  transactions: TransactionDTO[];
  createdAt: Date;
  name: string;
};

export class CsvError extends Data.TaggedError("CsvError")<{
  message: string;
}> {}
