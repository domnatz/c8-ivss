"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import {
  fetchTagsByFileId,
} from "@/_services/tag-service";
import { Tags } from "@/models/tags";

interface TagDetailsProps {
  onAddTag: (tag: Tags) => void;
  buttonText?: string;
  subgroupId: number | undefined;
  masterlistId: number | null;
}

export function TagDetails({
  onAddTag,
  buttonText = "Add Tag",
  subgroupId,
  masterlistId,
}: TagDetailsProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tags, setTags] = React.useState<Tags[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<number[]>([]);

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

    const intervalId = setInterval(fetchTagsPeriodically, 5000);

    return () => clearInterval(intervalId);
  }, [masterlistId]);

  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTagSelection = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const handleAddSelectedTags = () => {
    if (!subgroupId) {
      toast.error("No subgroup selected");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    try {
      const tagsToAdd = tags.filter(tag => selectedTags.includes(tag.tag_id));
      tagsToAdd.forEach(tag => onAddTag(tag));
      setSelectedTags([]);
      setOpen(false);
      toast.success(`Added ${tagsToAdd.length} tags successfully`);
    } catch (error) {
      console.error("Error adding tags:", error);
      toast.error("Failed to add tags");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) setSelectedTags([]);
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircleIcon className="h-5 w-5 mr-1" />
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
          <DialogDescription>
            Select tags to add to the selected subgroup
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 w-full">
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-col gap-2 max-h-[60vh] sm:max-h-[70vh] md:max-h-100 overflow-y-auto">
            {loading ? (
              <p className="text-center text-muted-foreground">
                Loading tags...
              </p>
            ) : filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <div
                  key={tag.tag_id}
                  className={`flex justify-between items-center p-2 border rounded-md w-full cursor-pointer ${
                    selectedTags.includes(tag.tag_id) 
                      ? "bg-primary/10 border-primary" 
                      : "bg-background"
                  }`}
                  onClick={() => toggleTagSelection(tag.tag_id)}
                >
                  <div className="flex-1 overflow-hidden w-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate font-medium">{tag.tag_name}</span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{tag.tag_name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {selectedTags.includes(tag.tag_id) && (
                    <CheckIcon className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No tags found</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleAddSelectedTags}
              disabled={selectedTags.length === 0}
              className="flex-1"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Add Selected Tags ({selectedTags.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}