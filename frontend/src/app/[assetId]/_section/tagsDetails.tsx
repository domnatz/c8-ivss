"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { uploadTags } from "@/services/tag-service";

// Unified tag interface that works with the backend
export interface Tags {
  tag_id: number;
  tag_name: string;
  description?: string;
  units?: string;
  file_id?: number;
  tag_type?: string;
  tag_data?: Record<string, unknown>;
}

interface TagDetailsProps {
  onAddTag: (tag: Tags) => void;
  buttonText?: string;
}

export function TagDetails({
  onAddTag,
  buttonText = "Add Tag",
}: TagDetailsProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tags, setTags] = React.useState<Tags[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch real tags from API
  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/tags");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setTags(data);
          } else {
            console.log("No tags found");
          }
        } else {
          console.error("Failed to fetch tags");
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTag = (tag: Tags) => {
    try {
      onAddTag(tag);
      setOpen(false);
      toast.success(`Tag "${tag.tag_name}" was added successfully`);
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadTags(file);
        toast.success("Tags uploaded successfully");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unknown error occurred");
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircleIcon className="h-5 w-5 mr-1" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
          <DialogDescription>
            Select tags to add to the selected subgroup
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input type="file" onChange={handleFileUpload} />
          <div className="flex flex-col gap-2">
            {loading ? (
              <p className="text-center text-muted-foreground">
                Loading tags...
              </p>
            ) : filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <div
                  key={tag.tag_id}
                  className="flex justify-between items-center p-2 border rounded-md"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{tag.tag_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {tag.units}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddTag(tag)}
                  >
                    Add
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No tags found</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}