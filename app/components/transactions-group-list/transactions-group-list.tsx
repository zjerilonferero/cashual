import { getTransactionGroups } from "@/app/actions/transaction-group";
import Link from "next/link";

async function TransactionsGroupList() {
  const groups = await getTransactionGroups();

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return groups.length === 0 ? (
    <p className="text-gray-500">
      No transaction groups yet. Upload a CSV to get started.
    </p>
  ) : (
    <div className="flex flex-col space-y-4">
      {groups.map((group) => (
        <Link
          key={group.id}
          href={`/statistics/groups/${group.id}`}
          className="p-4 rounded-lg bg-gray-400/10 hover:bg-gray-400/20 transition-colors"
        >
          <p className="text-sm">{group.name}</p>
          <span className="text-sm">{formatDate(group.createdAt)}</span>
        </Link>
      ))}
    </div>
  );
}

export default TransactionsGroupList;
