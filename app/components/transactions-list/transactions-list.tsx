"use client";

import { useLongPress } from "@/app/hooks/useLongPress";
import type { TransactionDTO } from "@/app/lib/transactions/schema";
import classNames from "classnames";
import { Check, HelpCircle } from "feather-icons-react";
import { useOptimistic, useState } from "react";
import { Checkbox, Label } from "radix-ui";
import { FloatingActionDeleteButton } from "../floating-action-button";
import { deleteTransactionByIds } from "@/app/actions/transaction-group";
import TransactionGroupLoading, {
  TransactionSkeleton,
} from "@/app/statistics/groups/[groupId]/loading";

interface TransactionProps extends TransactionDTO {
  onLongPress: () => void;
  isInSelectionMode: boolean;
  onTransactionSelect: (id: number) => void;
  isSelected: boolean;
}
function Transacation({
  name,
  date,
  type,
  amount,
  onLongPress,
  id,
  onTransactionSelect,
  isInSelectionMode,
  isSelected,
}: TransactionProps) {
  useState<Checkbox.CheckedState>("indeterminate");
  const attrs = useLongPress(onLongPress, {
    onFinish: () => onCheckedChange(),
  });

  const onCheckedChange = () => {
    onTransactionSelect(id);
  };

  return (
    <div {...attrs} className={classNames("flex items-center", {})}>
      {isInSelectionMode && (
        <div className="pointer-events-auto">
          <form>
            <label>
              <Checkbox.Root
                checked={isSelected}
                onCheckedChange={onCheckedChange}
                className="w-6 h-6 bg-transparent border border-muted data-[state=checked]:border-transparent rounded-full flex items-center justify-center mr-4"
                id={`transaction-${id}`}
              >
                <Checkbox.Indicator
                  forceMount
                  className="h-full w-full bg-primary rounded-full flex justify-center items-center data-[state=checked]:scale-100 data-[state=unchecked]:scale-0 transition-transform duration-300"
                >
                  <Check size={16} />
                </Checkbox.Indicator>
              </Checkbox.Root>
            </label>
          </form>
        </div>
      )}
      <Label.Root
        className="flex w-full items-center"
        htmlFor={`transaction-${id}`}
      >
        <div className="size-12 rounded-full bg-gray-400/10 mr-4 justify-center items-center flex">
          <HelpCircle strokeWidth={1.0} size={30} className="text-2xl" />
        </div>
        <div className="flex-1/2 flex flex-col">
          <h6 className="mb-2 text-sm">{name}</h6>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <div className="flex items-center">
          <h3
            className={classNames("text-lg", {
              "text-green-400": type === "income",
            })}
          >
            {type === "income" ? "+" : "-"}
            {amount}
            <span className="text-xs">eu</span>
          </h3>
        </div>
      </Label.Root>
    </div>
  );
}

interface TransactionsListProps {
  transactions: readonly TransactionDTO[];
}

function TransactionsList({ transactions }: TransactionsListProps) {
  const [isInSelectionMode, setIsSelectionMode] = useState(false);
  const [optimisticTransactions, removeTransactions] = useOptimistic(
    transactions,
    (currentState, ids: number[]) =>
      currentState.filter((transaction) => !ids.includes(transaction.id)),
  );
  const [selectedTransactions, setSelectedTransactions] = useState(
    () => new Set<number>(),
  );

  const onTransactionLongPress = () => {
    setIsSelectionMode(true);
  };

  const onDeleteTransactions = async () => {
    const idsToRemove = [...selectedTransactions];
    removeTransactions(idsToRemove);
    setSelectedTransactions(new Set());
    await deleteTransactionByIds(idsToRemove);
  };

  const addTransactionToSelection = (id: number) => {
    setSelectedTransactions((prev) => {
      if (prev.has(id)) {
        const newSet = new Set(prev);
        newSet.delete(id);
        return new Set(newSet);
      }
      return new Set(prev).add(id);
    });
  };

  return (
    <>
      <div className="flex flex-col space-y-8">
        {optimisticTransactions.map((transaction) => (
          <Transacation
            key={transaction.id}
            {...transaction}
            onLongPress={onTransactionLongPress}
            isInSelectionMode={isInSelectionMode}
            onTransactionSelect={addTransactionToSelection}
            isSelected={selectedTransactions.has(transaction.id)}
          />
        ))}
      </div>
      {isInSelectionMode && (
        <FloatingActionDeleteButton onDeletePress={onDeleteTransactions} />
      )}
    </>
  );
}

export default TransactionsList;
