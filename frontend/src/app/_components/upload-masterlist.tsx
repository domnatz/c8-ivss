"use client";

import { useState, useTransition } from "react";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { XIcon } from "lucide-react"; // Add import for X icon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { SelectFile } from "./select-file";
import { uploadMasterlist } from "@/_actions/masterlist-actions";
import { rootActions } from "../_redux/root-slice";
import { Masterlist } from "@/models/masterlist";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";

interface UploadMasterlistProps {
  className?: string;
  onUploadSuccess: () => void;
}

export function UploadMasterlist({
  className,
  onUploadSuccess,
}: UploadMasterlistProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedExistingFile, setSelectedExistingFile] =
    useState<Masterlist | null>(null);
  const dispatch = useAppDispatch();
  const state = useAppSelector((state: RootState) => state.rootState);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSelectedExistingFile(null);
    }
  };

  const handleExistingFileSelect = (file: Masterlist) => {
    setSelectedExistingFile(file);
    setSelectedFile(null);

    toast.success(`Selected existing file: ${file.file_name}`);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setSelectedExistingFile(null);
    dispatch(rootActions.selectedMasterlistIdSet(null));
  };

  const handleUploadMasterlist = () => {
    if (!selectedFile && !selectedExistingFile) {
      toast.error("Please select a file first");
      return;
    }

    if (selectedExistingFile) {
      toast.info(`Using existing file: ${selectedExistingFile.file_name}`);
      onUploadSuccess();
      return;
    }

    // Otherwise upload the new file
    dispatch(rootActions.masterlistUploadingSet(true));
    startTransition(async () => {
      try {
        const result = await uploadMasterlist(selectedFile!);
        if (result.success) {
          toast.success("Masterlist uploaded successfully");
          setSelectedFile(null);

          // If we have data back, add it to our redux store
          if (result.data) {
            dispatch(rootActions.addMasterlist(result.data));
          }

          onUploadSuccess();
        } else {
          toast.error(`Failed to upload masterlist: ${result.error}`);
        }
      } catch (error) {
        toast.error("An error occurred while uploading the masterlist");
      } finally {
        dispatch(rootActions.masterlistUploadingSet(false));
      }
    });
  };

  return (
    <div
      className={`p-2 border-b-[0.5px] items-start flex flex-col gap-2 justify-between ${
        className || ""
      }`}
    >
      <div className="flex flex-row items-center gap-2 w-full">
        {selectedFile || selectedExistingFile ? (
          <div className="w-full bg-blue-50 p-1.5 rounded-sm border border-blue-200 flex justify-between items-center">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span
                className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                  selectedFile
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {selectedFile ? "New File" : "Existing"}
              </span>
              <p
                className="text-xs font-medium truncate min-w-0 flex-1"
                title={
                  selectedFile
                    ? selectedFile.name
                    : selectedExistingFile?.file_name
                }
              >
                {selectedFile
                  ? selectedFile.name
                  : selectedExistingFile?.file_name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 flex-shrink-0 ml-1 hover:bg-blue-100"
              onClick={clearSelectedFile}
              title="Clear selection"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Input
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="w-full file:text-sm rounded-sm"
            id="masterlist"
            onChange={handleFileChange}
          />
        )}
        {!selectedFile && !selectedExistingFile && (
          <SelectFile onFileSelect={handleExistingFileSelect} />
        )}
      </div>

      <Button
        className="w-full rounded-sm"
        disabled={
          isPending ||
          state.masterlistUploading ||
          (!selectedFile && !selectedExistingFile)
        }
        onClick={handleUploadMasterlist}
      >
        <DocumentPlusIcon className="w-5 h-5 mr-2" />
        {isPending || state.masterlistUploading
          ? "Processing..."
          : selectedExistingFile
          ? "Use Selected File"
          : "Upload Masterlist"}
      </Button>
    </div>
  );
}
