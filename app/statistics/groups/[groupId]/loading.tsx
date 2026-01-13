export default function TransactionGroupLoading() {
  return (
    <div className="p-6 animate-pulse w-full">
      <div className="h-8 w-48 bg-neutral-800 rounded-lg mb-2" />
      <div className="h-4 w-32 bg-neutral-800/50 rounded mb-6" />

      {/* Summary section */}
      <div className="h-5 w-20 bg-neutral-800 rounded mb-4" />
      <div className="flex flex-col mb-4">
        <div className="h-4 w-64 bg-neutral-800/50 rounded my-4" />
        {/* Chart skeleton */}
        <div className="flex justify-between mb-1">
          <div className="h-3 w-12 bg-neutral-800/50 rounded" />
          <div className="h-3 w-12 bg-neutral-800/50 rounded" />
        </div>
        <div className="w-full h-6 bg-neutral-800 rounded-xl" />
      </div>

      {/* Transactions section */}
      <div className="h-5 w-36 bg-neutral-800 rounded my-4" />
      <div className="flex flex-col space-y-8">
        {[...Array(5)].map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="size-12 rounded-full bg-neutral-800 mr-4" />
      <div className="flex-1 flex flex-col">
        <div className="h-4 w-32 bg-neutral-800 rounded mb-2" />
        <div className="h-3 w-20 bg-neutral-800/50 rounded" />
      </div>
      <div className="h-6 w-16 bg-neutral-800 rounded" />
    </div>
  );
}
