"use client";

import { useEffect, useState } from "react";

interface IncomeExpenseChartProps {
  totalExpense: number;
  totalIncome: number;
}

export default function IncomeExpenseChart({
  totalExpense,
  totalIncome,
}: IncomeExpenseChartProps) {
  const [mounted, setMounted] = useState(false);

  const total = totalIncome + totalExpense;
  const totalIncomeInPercentage = Math.round(
    (totalIncome / (total || 1)) * 100,
  );
  const totalExpenseInPercentage = Math.round(
    (totalExpense / (total || 1)) * 100,
  );

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <>
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span>€ {Math.round(totalIncome)}</span>
        <span>€ {Math.round(totalExpense)}</span>
      </div>
      <div className="w-full h-6 rounded-xl overflow-hidden relative">
        <div
          className="absolute left-0 h-full bg-primary rounded-xl shadow-gray-900 shadow-md transition-all duration-500 ease-out"
          style={{ width: mounted ? `${totalIncomeInPercentage}%` : "0%" }}
        />
        <div
          className="absolute right-0 h-full bg-secondary rounded-xl shadow-gray-900 shadow-md transition-all duration-500 ease-out"
          style={{ width: mounted ? `${totalExpenseInPercentage}%` : "0%" }}
        />
      </div>
    </>
  );
}
