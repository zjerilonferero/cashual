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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction Groups</h1>
      <TransactionsGroupList />
      <Suspense>
        <FloatingActionButton />
      </Suspense>
    </div>
  );
}
