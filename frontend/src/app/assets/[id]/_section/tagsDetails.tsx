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
import {
  fetchTagsByFileId,
} from "@/_services/tag-service";
//import { addTagToSubgroupAction } from "@/_actions/tag-actions"; // Import addTagToSubgroupAction
import { Tags } from "@/models/tags";

interface TagDetailsProps {
  onAddTag: (tag: Tags) => void;
  buttonText?: string;
  subgroupId: number | undefined; // Add subgroupId prop
  masterlistId: number | null; // Add masterlistId prop
}

export function TagDetails({
  onAddTag,
  buttonText = "Add Tag",
  subgroupId, // Destructure subgroupId
  masterlistId, // Destructure masterlistId
}: TagDetailsProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tags, setTags] = React.useState<Tags[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch tags based on the selected masterlist ID
  React.useEffect(() => {
    const fetchInitialData = async () => {
      if (!masterlistId) return;
      try {
        setLoading(true);
        const data = await fetchTagsByFileId(masterlistId);
        setTags(data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [masterlistId]);

  // Fetch tags periodically without refreshing the whole modal
  React.useEffect(() => {
    const fetchTagsPeriodically = async () => {
      if (!masterlistId) return;
      try {
        const data = await fetchTagsByFileId(masterlistId);
        setTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    const intervalId = setInterval(fetchTagsPeriodically, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [masterlistId]);

  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    // In tagsDetails.tsx, modify handleAddTag:
  const handleAddTag = async (tag: Tags) => {
    if (!subgroupId) {
      toast.error("No subgroup selected");
      return;
    }
  
    try {
      onAddTag(tag);
      setOpen(false);
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
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
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto"> {/* Make the tags list scrollable */}
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