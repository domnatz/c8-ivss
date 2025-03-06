"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Masterlist } from "@/components/user/app-sidebar";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export type Tags = {
  tag_id: number;
  file_id: number; // Foreign key referencing Masterlist.file_id
  tag_type: "classified" | "unclassified"; // Classification field
  tag_name: string;
  tag_data: Record<string, unknown>; // JSON data type
};

// Mock tags data
const mockTags: Tags[] = [
  {
    tag_id: 1,
    file_id: 101,
    tag_type: "classified",
    tag_name: "Tag 1",
    tag_data: { value: 100, unit: "°C" }, // JSON data
  },
  {
    tag_id: 2,
    file_id: 102,
    tag_type: "unclassified",
    tag_name: "Tag 2",
    tag_data: { value: 220, unit: "V" }, // JSON data
  },
  {
    tag_id: 3,
    file_id: 103,
    tag_type: "classified",
    tag_name: "Tag 3",
    tag_data: { value: 50, unit: "psi" }, // JSON data
  },
];

interface TagDetailsProps {
  onAddTag: (tag: Tags) => void;
}

export function TagDetails({ onAddTag }: TagDetailsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><PlusCircleIcon className="h-5 w-5"/>Add Tag</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add raw tags</DialogTitle>
          <DialogDescription>
            Please select a tag to add to the subgroup
          </DialogDescription>
        </DialogHeader>

        {/* Tag Table */}
        <div className="overflow-auto max-h-[300px]">
          {mockTags.map((tag) => (
            <span key={tag.tag_id} className="border-b flex flex-row justify-between">
              <div className="p-2">{tag.tag_name}</div>
              <div className="p-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onAddTag(tag);
                  }}
                >
                  <PlusCircleIcon className="w-5 h-5" />
                  Add
                </Button>
              </div>
            </span>
          ))}
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}