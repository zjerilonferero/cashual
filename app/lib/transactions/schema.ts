import { Data, Schema } from "effect";

// Base transaction type schema
export const TransactionTypeSchema = Schema.Literal("income", "expense");

// Transaction with required id (persisted in database)
export class Transaction extends Schema.Class<Transaction>("Transaction")({
  id: Schema.Number,
  date: Schema.String,
  name: Schema.String,
  amount: Schema.Number,
  type: TransactionTypeSchema,
}) {}

export type TransactionDTO = typeof Transaction.Encoded;

// Response when fetching/creating a transaction group with full details
export class TransactionGroupResponse extends Schema.Class<TransactionGroupResponse>(
  "TransactionGroupResponse",
)({
  groupId: Schema.Number,
  totalExpense: Schema.Number,
  totalIncome: Schema.Number,
  transactions: Schema.Array(Transaction),
  createdAt: Schema.DateFromSelf,
  name: Schema.String,
}) {}

export type TransactionGroupResponseDTO =
  typeof TransactionGroupResponse.Encoded;

// TransactionGroup summary (for listing groups without transactions)
export class TransactionGroupSummary extends Schema.Class<TransactionGroupSummary>(
  "TransactionGroupSummary",
)({
  id: Schema.Number,
  createdAt: Schema.DateFromSelf,
  name: Schema.String,
  totalIncome: Schema.Number,
  totalExpense: Schema.Number,
}) {}

export type TransactionGroupSummaryDTO = typeof TransactionGroupSummary.Encoded;

export class TransactionGroupError extends Data.TaggedError(
  "TransactionGroupError",
)<{
  message: string;
}> {}
