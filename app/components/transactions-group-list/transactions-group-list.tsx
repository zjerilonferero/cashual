import { getTransactionGroups } from "@/app/actions/transaction-group";
import Link from "next/link";
import { ChevronRight, Inbox } from "feather-icons-react";
import classNames from "classnames";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatNetAmount(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
async function TransactionsGroupList() {
  const groups = await getTransactionGroups();

  if (groups.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => {
        const netAmount = group.totalIncome - group.totalExpense;

        return (
          <Link
            key={group.id}
            href={`/statistics/groups/${group.id}`}
            className="rounded-2xl border border-neutral-700 bg-neutral-900/50 flex overflow-hidden transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-800/50"
          >
            <div
              className={classNames("w-1 shrink-0", {
                "bg-primary": netAmount > 0,
                "bg-secondary": netAmount < 0,
                "bg-neutral-600": netAmount === 0,
              })}
            />

            <div className="flex-1 p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-neutral-200 font-medium truncate">
                  {group.name}
                </p>
                <p className="text-neutral-500 text-sm mt-0.5">
                  {formatDate(group.createdAt)}
                </p>
              </div>

              <p
                className={classNames("text-sm font-medium", {
                  "text-primary": netAmount > 0,
                  "text-secondary": netAmount < 0,
                  "text-neutral-500": netAmount === 0,
                })}
              >
                {netAmount >= 0 ? "+" : "-"}€
                {formatNetAmount(Math.abs(netAmount))}
              </p>

              <ChevronRight size={20} className="text-neutral-500" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="p-4 rounded-2xl bg-neutral-800/50 mb-6">
        <Inbox size={48} strokeWidth={1} className="text-neutral-500" />
      </div>
      <p className="text-neutral-300 font-medium mb-2">
        No transaction groups yet
      </p>
      <p className="text-neutral-500 text-sm text-center">
        Tap the + button to import your first CSV
      </p>
    </div>
  );
}

export default TransactionsGroupList;
