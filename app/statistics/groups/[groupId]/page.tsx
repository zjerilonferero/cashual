import { notFound } from "next/navigation";
import { getTransactionGroupById } from "@/app/actions/transaction-group";
import { getCategories } from "@/app/actions/category";
import TransactionsList from "@/app/components/transactions-list/transactions-list";
import IncomeExpenseChart from "@/app/components/income-expense-chart/income-expense-chart";
import { ActionMenu } from "@/app/components/action-menu";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function TransactionGroupPage({ params }: PageProps) {
  const { groupId } = await params;
  const groupIdNumber = parseInt(groupId, 10);

  if (isNaN(groupIdNumber)) {
    notFound();
  }

  let group;
  try {
    group = await getTransactionGroupById(groupIdNumber);
  } catch {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div className="p-6 overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
          <p className="text-gray-500 text-sm mb-6">
            {formatDate(group.createdAt)}
          </p>
        </div>
        <ActionMenu />
      </div>

      <h2 className="mb-4">Summary</h2>
      <div className="flex flex-col mb-4">
        <p className="my-4 text-sm">
          You received{" "}
          <span className="text-primary font-bold">
            € {Math.round(group.totalIncome)}
          </span>{" "}
          and spent{" "}
          <span className="text-secondary font-bold">
            € {Math.round(group.totalExpense)}
          </span>
        </p>
        <IncomeExpenseChart
          totalIncome={group.totalIncome}
          totalExpense={group.totalExpense}
        />
      </div>

      <h2 className="my-4">My Transactions</h2>
      <TransactionsList
        transactions={group.transactions}
        categories={categories}
      />
    </div>
  );
}
