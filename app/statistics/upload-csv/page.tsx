"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import { parseCsvAction } from "@/app/actions/csv";
import { Input } from "@/app/components/ui";
import { File, Check, Upload } from "feather-icons-react";

enum UploadState {
  Idle = "idle",
  FileSelected = "fileSelected",
  Uploading = "uploading",
  Success = "success",
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function deriveUploadState(
  response: { groupId: number } | null,
  pending: boolean,
  selectedFile: File | null,
): UploadState {
  if (response?.groupId) return UploadState.Success;
  if (pending) return UploadState.Uploading;
  if (selectedFile) return UploadState.FileSelected;
  return UploadState.Idle;
}

export default function UploadCsvPage() {
  const [response, action, pending] = useActionState(parseCsvAction, null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadState = deriveUploadState(response, pending, selectedFile);
  const isDisabled = pending || uploadState === UploadState.Success;

  useEffect(() => {
    if (response?.groupId) {
      const timeout = setTimeout(() => {
        router.push(`/statistics/groups/${response.groupId}`);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [response, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-6 max-w-full">
      <div className="w-full flex-1 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Import Transactions
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload a CSV file from your bank to get started
          </p>
        </div>

        <form action={action} className="flex-1 flex flex-col">
          <div className="space-y-6">
            {uploadState === UploadState.Success && <SuccessState />}
            {uploadState === UploadState.Uploading && selectedFile && (
              <UploadingState fileName={selectedFile.name} />
            )}
            {uploadState === UploadState.FileSelected && selectedFile && (
              <FilePreview
                file={selectedFile}
                onClear={clearFile}
                disabled={pending}
              />
            )}
            {uploadState === UploadState.Idle && (
              <UploadButton onClick={handleUploadClick} />
            )}

            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              name="file"
              accept=".csv"
              required
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              className={classNames({
                "opacity-50 pointer-events-none":
                  uploadState === UploadState.Success,
              })}
            >
              <Input
                name="transactionGroupName"
                label="Group name"
                type="text"
                placeholder="e.g. January 2026"
                required
                disabled={isDisabled}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isDisabled || !selectedFile}
            className={classNames(
              "mt-auto w-full py-4 rounded-xl font-medium text-base transition-all duration-200",
              {
                "bg-neutral-800 text-neutral-500 cursor-not-allowed":
                  isDisabled || !selectedFile,
                "bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98]":
                  !isDisabled && selectedFile,
                "animate-pulse": pending,
              },
            )}
          >
            {pending ? "Processing..." : "Import Transactions"}
          </button>
        </form>
      </div>
    </div>
  );
}

function UploadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-neutral-700 bg-neutral-900/50 p-8 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-800/50 active:scale-[0.98]"
    >
      <div className="p-3 rounded-xl bg-neutral-800">
        <Upload size={24} strokeWidth={1.5} className="text-neutral-400" />
      </div>
      <div className="text-left">
        <p className="text-neutral-200 font-medium">Choose CSV file</p>
        <p className="text-neutral-500 text-sm">Click to browse your files</p>
      </div>
    </button>
  );
}

function FilePreview({
  file,
  onClear,
  disabled,
}: {
  file: File;
  onClear: () => void;
  disabled: boolean;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <File size={24} strokeWidth={1.5} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-neutral-200 font-medium truncate">{file.name}</p>
          <p className="text-neutral-500 text-sm mt-0.5">
            {formatFileSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="text-neutral-500 hover:text-neutral-300 transition-colors p-1 disabled:opacity-50"
          aria-label="Remove file"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function UploadingState({ fileName }: { fileName: string }) {
  return (
    <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <File size={24} strokeWidth={1.5} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-neutral-200 font-medium truncate">{fileName}</p>
          <p className="text-neutral-500 text-sm mt-0.5">Processing...</p>
        </div>
      </div>
      <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full w-1/4 bg-primary rounded-full animate-progress-indeterminate" />
      </div>
    </div>
  );
}

function SuccessState() {
  return (
    <div className="animate-in fade-in duration-300 rounded-2xl border border-green-800/50 bg-green-950/30 p-10 flex flex-col items-center">
      <div className="animate-checkmark p-4 rounded-full bg-green-500/20 mb-4">
        <Check size={32} strokeWidth={2} className="text-green-400" />
      </div>
      <p className="text-green-300 font-medium">Import complete</p>
      <p className="text-green-500/70 text-sm mt-1">Redirecting...</p>
    </div>
  );
}
