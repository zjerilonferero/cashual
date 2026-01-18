"use client";

import { useLongPress } from "@/app/hooks/useLongPress";
import type {
  TransactionDTO,
  TransactionCategoryDTO,
} from "@/app/lib/transactions/schema";
import type { CategoryDTO } from "@/app/lib/category";
import classNames from "classnames";
import { Check, HelpCircle } from "feather-icons-react";
import { useOptimistic, useState, useTransition, useMemo } from "react";
import { Checkbox, Label } from "radix-ui";
import { FloatingActionButtons } from "../floating-action-button";
import { CategoryPicker } from "../category-picker";
import { CategoryFilter } from "../category-filter";
import { deleteTransactionByIds } from "@/app/actions/transaction-group";
import {
  updateTransactionCategory,
  updateTransactionCategoriesBatch,
} from "@/app/actions/transaction";

interface TransactionProps extends TransactionDTO {
  onLongPress: () => void;
  isInSelectionMode: boolean;
  onTransactionSelect: (id: number) => void;
  onCategoryClick: (transactionId: number, currentCategoryId: number) => void;
  isSelected: boolean;
}

function Transaction({
  name,
  date,
  type,
  amount,
  category,
  onLongPress,
  id,
  onTransactionSelect,
  onCategoryClick,
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

  const handleCategoryClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isInSelectionMode) {
      onCategoryClick(id, category.id);
    }
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
          <h6 className="mb-1 text-sm">{name}</h6>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{date}</span>
            <button
              type="button"
              onClick={handleCategoryClick}
              disabled={isInSelectionMode}
              className={classNames(
                "text-xs px-2 py-0.5 rounded-full bg-gray-400/10 transition-all",
                !isInSelectionMode && "active:scale-95 hover:brightness-110"
              )}
              style={
                category.color
                  ? {
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                    }
                  : undefined
              }
            >
              {category.name}
            </button>
          </div>
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

type OptimisticAction =
  | { type: "delete"; ids: number[] }
  | { type: "updateCategory"; ids: number[]; category: TransactionCategoryDTO };

interface PickerState {
  isOpen: boolean;
  mode: "single" | "batch";
  transactionId: number | null;
  currentCategoryId: number | null;
}

interface TransactionsListProps {
  transactions: readonly TransactionDTO[];
  categories: readonly CategoryDTO[];
}

function TransactionsList({
  transactions,
  categories,
}: TransactionsListProps) {
  const [isInSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState(
    () => new Set<number>()
  );
  const [pickerState, setPickerState] = useState<PickerState>({
    isOpen: false,
    mode: "single",
    transactionId: null,
    currentCategoryId: null,
  });
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<
    number | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const [optimisticTransactions, applyOptimisticUpdate] = useOptimistic(
    transactions,
    (currentState, action: OptimisticAction) => {
      switch (action.type) {
        case "delete":
          return currentState.filter(
            (transaction) => !action.ids.includes(transaction.id)
          );
        case "updateCategory":
          return currentState.map((transaction) =>
            action.ids.includes(transaction.id)
              ? { ...transaction, category: action.category }
              : transaction
          );
        default:
          return currentState;
      }
    }
  );

  const filteredTransactions = useMemo(() => {
    if (selectedFilterCategory === null) {
      return optimisticTransactions;
    }
    return optimisticTransactions.filter(
      (transaction) => transaction.category.id === selectedFilterCategory
    );
  }, [optimisticTransactions, selectedFilterCategory]);

  const onTransactionLongPress = () => {
    setIsSelectionMode(true);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedTransactions(new Set());
  };

  const onDeleteTransactions = async () => {
    const idsToRemove = [...selectedTransactions];

    startTransition(async () => {
      applyOptimisticUpdate({ type: "delete", ids: idsToRemove });
      await deleteTransactionByIds(idsToRemove);
    });

    exitSelectionMode();
  };

  const addTransactionToSelection = (id: number) => {
    setSelectedTransactions((prev) => {
      if (prev.has(id)) {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      }
      return new Set(prev).add(id);
    });
  };

  const openPickerForSingle = (
    transactionId: number,
    currentCategoryId: number
  ) => {
    setPickerState({
      isOpen: true,
      mode: "single",
      transactionId,
      currentCategoryId,
    });
  };

  const openPickerForBatch = () => {
    setPickerState({
      isOpen: true,
      mode: "batch",
      transactionId: null,
      currentCategoryId: null,
    });
  };

  const closePicker = () => {
    setPickerState({
      isOpen: false,
      mode: "single",
      transactionId: null,
      currentCategoryId: null,
    });
  };

  const handleCategorySelect = async (categoryId: number) => {
    const selectedCategory = categories.find((c) => c.id === categoryId);
    if (!selectedCategory) return;

    const categoryForTransaction: TransactionCategoryDTO = {
      id: selectedCategory.id,
      name: selectedCategory.name,
      color: selectedCategory.color,
    };

    if (pickerState.mode === "single" && pickerState.transactionId) {
      const transactionId = pickerState.transactionId;

      startTransition(async () => {
        applyOptimisticUpdate({
          type: "updateCategory",
          ids: [transactionId],
          category: categoryForTransaction,
        });
        await updateTransactionCategory(transactionId, categoryId);
      });
    } else if (pickerState.mode === "batch") {
      const ids = [...selectedTransactions];

      startTransition(async () => {
        applyOptimisticUpdate({
          type: "updateCategory",
          ids,
          category: categoryForTransaction,
        });
        await updateTransactionCategoriesBatch(ids, categoryId);
      });

      exitSelectionMode();
    }

    closePicker();
  };

  return (
    <>
      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedFilterCategory}
          onSelectCategory={setSelectedFilterCategory}
        />
      </div>

      <div className="flex flex-col space-y-8">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No transactions in this category
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <Transaction
              key={transaction.id}
              {...transaction}
              onLongPress={onTransactionLongPress}
              isInSelectionMode={isInSelectionMode}
              onTransactionSelect={addTransactionToSelection}
              onCategoryClick={openPickerForSingle}
              isSelected={selectedTransactions.has(transaction.id)}
            />
          ))
        )}
      </div>

      {isInSelectionMode && (
        <FloatingActionButtons
          onDeletePress={onDeleteTransactions}
          onCategorizePress={openPickerForBatch}
          isCategorizeDisabled={selectedTransactions.size === 0 || isPending}
        />
      )}

      <CategoryPicker
        isOpen={pickerState.isOpen}
        onClose={closePicker}
        onSelect={handleCategorySelect}
        currentCategoryId={pickerState.currentCategoryId}
        categories={categories}
      />
    </>
  );
}

export default TransactionsList;
