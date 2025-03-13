"use client";

import * as React from "react";
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAllMasterlists } from "@/_actions/masterlist-actions";
import { rootActions } from "../_redux/root-slice";
import { Masterlist } from "@/models/masterlist";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Skeleton } from "@/components/ui/skeleton";

interface SelectFileProps {
  className?: string;
  onFileSelect?: (file: Masterlist) => void;
  onClearSelection?: () => void; // Add new prop
}

export function SelectFile({
  className,
  onFileSelect,
  onClearSelection,
}: SelectFileProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [files, setFiles] = React.useState<any[]>([]);
  const dispatch = useAppDispatch();

  // Safely access Redux state with default values
  const state = useAppSelector((state: RootState) => state.rootState);
  const masterlists = state?.masterlists || [];
  const masterlistLoading = state?.masterlistLoading || false;
  const selectedMasterlistId = state?.selectedMasterlistId || null;

  const loadFiles = React.useCallback(async () => {
    setLoading(true);
    dispatch(rootActions.masterlistLoadingSet(true));

    try {
      const result = await getAllMasterlists();
      if (result.success) {
        const fileData = Array.isArray(result.data) ? result.data : [];
        setFiles(fileData);
        dispatch(rootActions.masterlistsSet(fileData));
      } else {
        toast.error(`Failed to load files: ${result.error}`);
      }
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
      dispatch(rootActions.masterlistLoadingSet(false));
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open, loadFiles]);

  const handleSelectFile = (file: Masterlist) => {
    dispatch(rootActions.selectedMasterlistIdSet(file.file_id));

    // Call the callback with the selected file data
    if (onFileSelect) {
      onFileSelect(file);
    }

    setOpen(false);
  };

  const handleClearSelection = () => {
    dispatch(rootActions.selectedMasterlistIdSet(null));
    if (onClearSelection) {
      onClearSelection();
    }
  };

  // Use local state as fallback if Redux state is not ready
  const displayFiles = masterlists.length > 0 ? masterlists : files;
  const isLoading = loading || masterlistLoading;

  return (
    <div className={`${className || ""}`}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <ChevronUpDownIcon className="w-5 h-5" />
          </Button>
        </DialogTrigger>

        {/* Add Clear selection button at the top of dialog */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle>Masterfiles</DialogTitle>
              <DialogDescription>select a file to add tags</DialogDescription>
            </div>
            {selectedMasterlistId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-7 text-xs"
              >
                Clear selection
              </Button>
            )}
          </DialogHeader>

          {isLoading ? (
             <Skeleton className="w-full h-[30px] rounded-md" />
          ) : displayFiles && displayFiles.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {displayFiles.map((file) => (
                <Button
                  key={file.file_id}
                  variant={
                    selectedMasterlistId === file.file_id
                      ? "default"
                      : "outline"
                  }
                  className="flex flex-row justify-start w-full"
                  onClick={() => handleSelectFile(file)}
                >
                  <span>{file.file_name}</span>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-center py-4">No files available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
