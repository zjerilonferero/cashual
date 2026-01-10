import { Data } from "effect";

export type TransactionGroupDTO = {
  id: number;
  createdAt: Date;
  name: string;
  transactions: TransactionDTO[];
};

export type TransactionDTO = {
  id: number;
  name: string;
  date: string;
  amount: number;
  type: "income" | "expense";
};

export class TransactionGroupError extends Data.TaggedError(
  "TransactionGroupError",
)<{
  message: string;
}> {}
