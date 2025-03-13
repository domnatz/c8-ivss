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
import { fetchTagsByFileId } from "@/_services/tag-service";
import { addTagToSubgroupAction } from "@/_actions/tag-actions";
import { Tags } from "@/models/tags";
import { useDispatch, useSelector } from "react-redux";
import { assetAction } from "../_redux/asset-slice";
import { RootState } from "@/store";

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
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Get tags from Redux store instead of local state
  const state = useSelector((state: RootState) => state.assetState);

  // Fetch tags when modal opens or masterlistId changes
  const fetchTags = React.useCallback(async () => {
    if (!masterlistId) return;
    try {
      setLoading(true);
      const data = await fetchTagsByFileId(masterlistId);
      dispatch(assetAction.availableTagsLoaded(data));
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  }, [masterlistId, dispatch]);

  // Fetch tags when modal opens or masterlistId changes
  React.useEffect(() => {
    if (open && masterlistId) {
      fetchTags();
    }
  }, [open, masterlistId, fetchTags]);

  const filteredTags = state.availableTags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTag = async (tag: Tags) => {
    if (!subgroupId) {
      toast.error("No subgroup selected");
      return;
    }

    try {
      const result = await addTagToSubgroupAction(
        subgroupId,
        tag.tag_id,
        tag.tag_name
      );
      if (result.success) {
        onAddTag(tag);
        setOpen(false);
        toast.success(`Tag "${tag.tag_name}" was added successfully`);
      } else {
        throw new Error(result.error);
      }
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
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
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
