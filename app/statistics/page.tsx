import { headers } from "next/headers";
import { FloatingActionButton } from "../components/floating-action-button";
import TransactionsGroupList from "../components/transactions-group-list/transactions-group-list";
import { Suspense } from "react";
import { auth } from "../lib/auth";
import { redirect } from "next/navigation";

export default async function StatisticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-6 max-w-full">
      <div className="w-full flex-1 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Transaction Groups
          </h1>
          <p className="text-muted-foreground text-sm">
            View and manage your imported transactions
          </p>
        </div>

        <TransactionsGroupList />

        <Suspense>
          <FloatingActionButton />
        </Suspense>
      </div>
    </div>
  );
}
