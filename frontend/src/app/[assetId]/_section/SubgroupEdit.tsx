"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchForm } from "@/components/user/search-form";
import {
  AdjustmentsVerticalIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagDetails, Tags } from "./tagsDetails";
import { Asset } from "@/models/asset";
import { Subgroup } from "@/models/subgroup";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { getAssetById } from "@/_services/asset-service";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { createSubgroup } from "@/_actions/asset-actions";

interface SubgroupEditProps {
  selectedAsset: Asset | null;
}

export default function SubgroupEdit({ selectedAsset }: SubgroupEditProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubgroup, setSelectedSubgroup] =
    React.useState<Subgroup | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">(
    "newest"
  );
  const [loading, setLoading] = React.useState(false);
  const [subgroupTags, setSubgroupTags] = React.useState<Subgroup_tag[]>([]);
  const params = useParams();
  const assetId = Number(params.assetId);

  // Select the first subgroup by default when asset changes
  React.useEffect(() => {
    if (
      selectedAsset &&
      selectedAsset.subgroups &&
      selectedAsset.subgroups.length > 0
    ) {
      setSelectedSubgroup(selectedAsset.subgroups[0]);
    } else {
      setSelectedSubgroup(null);
    }
  }, [selectedAsset]);

  // Update tags when selected subgroup changes
  React.useEffect(() => {
    if (selectedSubgroup) {
      setSubgroupTags(selectedSubgroup.subgroup_tags || []);
    } else {
      setSubgroupTags([]);
    }
  }, [selectedSubgroup]);

  const filteredTags = subgroupTags
    .filter((tag) =>
      tag.subgroup_tag_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "newest"
        ? b.subgroup_tag_id - a.subgroup_tag_id
        : a.subgroup_tag_id - b.subgroup_tag_id
    );

  const handleAddSubgroup = async () => {
    if (!assetId) return;

    try {
      setLoading(true);
      const result = await createSubgroup(assetId);
      if (result.success) {
        toast.success("New subgroup was added successfully");

        // Refresh asset data
        const updatedAsset = await getAssetById(assetId);

        toast.info("Refresh the page to see the new subgroup");
      } else {
        toast.error(
          `Failed to create subgroup: ${result.error || "An error occurred"}`
        );
      }
    } catch (error) {
      console.error("Error creating subgroup:", error);
      toast.error("Failed to create subgroup");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (tag: Tags) => {
    if (!selectedSubgroup || !selectedAsset) return;

    try {
      setLoading(true);

      // You would normally call an API here to add the tag
      // Since we don't have that endpoint in the service yet, we'll simulate it

      // Create a new tag object
      const highestId = Math.max(
        0,
        ...(selectedAsset.subgroups ?? []).flatMap(
          (subgroup) =>
            subgroup.subgroup_tags?.map((tag) => tag.subgroup_tag_id) ?? []
        )
      );
      const newTagId = highestId + 1;

      const newTag: Subgroup_tag = {
        subgroup_tag_id: newTagId,
        tag_id: tag.tag_id,
        subgroup_id: selectedSubgroup.subgroup_id,
        subgroup_tag_name: tag.tag_name,
      };

      // Add it locally for now
      setSubgroupTags((prev) => [...prev, newTag]);

      toast.success(
        `Added "${tag.tag_name}" to ${selectedSubgroup.subgroup_name}`
      );
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag to subgroup");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedAsset) {
    return (
      <div className="w-full flex items-center justify-center">
        Loading asset details...
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Subgroup Editor</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSubgroup}
          disabled={loading}
        >
          <PlusCircleIcon className="w-4 h-4 mr-1" />
          Add Subgroup
        </Button>
      </div>

      <div className="w-full flex flex-row items-center gap-2">
        <SearchForm
          className="w-full"
          value={searchQuery}
          onInputChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tags..."
        />

        <DropdownMenu>
          <DropdownMenuTrigger className="px-2 py-1 flex items-center gap-1 border border-zinc-200 rounded-md text-foreground text-sm">
            <AdjustmentsVerticalIcon className="w-4 h-4 text-foreground" />
            Sort
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder("newest")}>
              Newest Added
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
              Oldest Added
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-row w-full gap-2">
        <Select
          value={selectedSubgroup?.subgroup_id.toString()}
          onValueChange={(value: string) => {
            const subgroup = selectedAsset?.subgroups?.find(
              (sub) => sub.subgroup_id === Number(value)
            );
            setSelectedSubgroup(subgroup ?? null);
          }}
        >
          <SelectTrigger className="w-full shadow-none">
            <SelectValue placeholder="Select a subgroup" />
          </SelectTrigger>
          <SelectContent>
            {selectedAsset?.subgroups?.map((subgroup) => (
              <SelectItem
                key={subgroup.subgroup_id}
                value={subgroup.subgroup_id.toString()}
              >
                {subgroup.subgroup_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TagDetails onAddTag={handleAddTag} />
      </div>

      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full overflow-y-auto">
        {selectedSubgroup ? (
          <div>
            {filteredTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => (
                  <Button
                    key={tag.subgroup_tag_id}
                    variant="outline"
                    className="flex items-center justify-between gap-2"
                  >
                    {tag.subgroup_tag_name}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No tags found for this subgroup.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">
              Select a subgroup to view its tags
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
