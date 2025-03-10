"use client";

import * as React from "react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
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
import { getMasterlist } from "@/_actions/asset-actions"; // Import the getMasterlist action
import { Masterlist } from "@/models/masterlist";

interface SelectFileProps {
  className?: string;
}

export function SelectFile({ className }: SelectFileProps) {
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState<Masterlist[]>([]); // Use Masterlist type

  React.useEffect(() => {
    async function loadFiles() {
      try {
        const result = await getMasterlist(); // Fetch latest masterlist
        if (result.success) {
          console.log("Fetched files:", result.data); // Add logging to check fetched data
          setFiles(Array.isArray(result.data) ? result.data : [result.data]); // Ensure files is an array
        } else {
          toast.error("Failed to load files");
        }
      } catch (error) {
        toast.error("Failed to load files");
      }
    }
    loadFiles();
  }, []);

  React.useEffect(() => {
    console.log("Files state updated:", files); // Add logging to check state update
  }, [files]);

  return (
    <div className={`${className || ""}`}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <ChevronUpDownIcon className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a File</DialogTitle>
            <DialogDescription>
              Select a file to add tags
            </DialogDescription>
          </DialogHeader>

          {/* Map masterlist here */}
          {files.length > 0 ? (
            files.map((file) => (
              <Button key={file.file_id} variant="outline" className="flex flex-row justify-start w-full">
                <span>{file.file_name}</span>
              </Button>
            ))
          ) : (
            <p>No files available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}