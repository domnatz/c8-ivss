"use client";

import { useTransition } from "react";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadMasterlistFile } from "@/_services/masterlist-service"; // Update the import path
import { toast } from "react-toastify";
import { SelectFile } from "./select-file";

interface UploadMasterlistProps {
  className?: string;
  onUploadSuccess: () => void;
}

export function UploadMasterlist({
  className,
  onUploadSuccess,
}: UploadMasterlistProps) {
  const [isPending, startTransition] = useTransition();

  const handleUploadMasterlist = (file: File) => {
    startTransition(async () => {
      try {
        const result = await uploadMasterlistFile(file);
        if (result.success) {
          toast.success("Masterlist uploaded successfully");
          onUploadSuccess();
        } else {
          toast.error(`Failed to upload masterlist: ${result.error}`);
        }
      } catch (error) {
        toast.error("An error occurred while uploading the masterlist");
      }
    });
  };

  return (
    <div
      className={`p-2 border-b-[0.5px] items-start flex flex-col gap-2 justify-between ${
        className || ""
      }`}
    >
      <div className="flex flex-row items-center gap-2">
        <Input
          type="file"
          accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="w-full file:text-sm rounded-sm"
          id="masterlist"
          onChange={(e) => {
            if (e.target.files) {
              handleUploadMasterlist(e.target.files[0]);
            }
          }}
        />
        <SelectFile/>
      </div>
      <Button className="w-full rounded-sm" disabled={isPending}>
        <DocumentPlusIcon className="w-5 h-5" />
        Upload Masterlist
      </Button>
    </div>
  );
}