"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseCsvAction } from "@/app/actions/csv";
import { Input } from "@/app/components/ui";
import { UploadCloud } from "feather-icons-react";

export default function UploadCsvPage() {
  const [response, action, pending] = useActionState(parseCsvAction, null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (response?.groupId) {
      router.push(`/statistics/groups/${response.groupId}`);
    }
  }, [response, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file?.name ?? null);
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-2xl font-bold mb-6">Upload CSV</h1>
      <form action={action}>
        <label
          htmlFor="file-upload"
          className="border-2 border-dashed border-gray-400/50 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-400/10 transition-colors mt-4"
        >
          <UploadCloud
            size={48}
            strokeWidth={1}
            className="text-gray-400 mb-4"
          />
          <span className="text-gray-400">Upload a file</span>
        </label>
        <input
          type="file"
          id="file-upload"
          name="file"
          accept=".csv"
          required
          className="hidden"
          onChange={handleFileChange}
        />

        {selectedFile && (
          <p className="text-sm text-gray-400 mb-4">{selectedFile}</p>
        )}
        <Input
          name="transactionGroupName"
          className="mt-4"
          label="Transaction group name"
          type="text"
          placeholder="Transactions of January"
          required
        />
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {pending ? "Parsing..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
