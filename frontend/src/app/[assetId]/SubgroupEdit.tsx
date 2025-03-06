"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchForm } from "@/components/user/search-form";
import { AdjustmentsVerticalIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Subgroup, Asset, subgroup_tag } from "@/components/user/app-sidebar"; // Import types
import { TagDetails, Tags } from "./tagsDetails";

// Mock data for assets and their subgroups
export const mockAssets: Asset[] = [
  {
    asset_id: 1,
    asset_type: "Transformer",
    asset_name: "Transformer 1",
    subgroups: [
      {
        subgroup_id: 1,
        subgroup_name: "Temperature Tags",
        subgroup_tags: [], // Initialize subgroup_tags as an empty array
      },
      {
        subgroup_id: 2,
        subgroup_name: "Voltage Tags",
        subgroup_tags: [], // Initialize subgroup_tags as an empty array
      },
    ],
  },
  {
    asset_id: 2,
    asset_type: "Transformer",
    asset_name: "TISTING",
    subgroups: [
      {
        subgroup_id: 3,
        subgroup_name: "Pressure Tags",
        subgroup_tags: [], // Initialize subgroup_tags as an empty array
      },
      {
        subgroup_id: 4,
        subgroup_name: "Flow Tags",
        subgroup_tags: [], // Initialize subgroup_tags as an empty array
      },
    ],
  },
];

export default function SubgroupEdit() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubgroup, setSelectedSubgroup] = React.useState<Subgroup | null>(null);
  const [assets, setAssets] = React.useState<Asset[]>(mockAssets);
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest");
  const params = useParams(); // Get dynamic route parameters
  const { assetId } = params; // Extract the dynamic route parameter

  // Find the selected asset based on assetId
  const selectedAsset = assets.find((asset) => asset.asset_id === Number(assetId));

  // Filter and sort tags based on searchQuery and sortOrder for the selected subgroup
  const filteredTags = selectedSubgroup
    ? (selectedSubgroup.subgroup_tags ?? [])
        .filter((tag) =>
          tag.subgroup_tag_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => (sortOrder === "newest" ? b.subgroup_tag_id - a.subgroup_tag_id : a.subgroup_tag_id - b.subgroup_tag_id))
    : [];

  // Function to handle adding a tag to the selected subgroup
  const handleAddTag = (tag: Tags) => {
    if (selectedSubgroup && selectedAsset) {
      // Find the highest existing subgroup_tag_id and increment it by 1
      const highestId = Math.max(
        0,
        ...selectedAsset.subgroups.flatMap((subgroup) =>
          subgroup.subgroup_tags?.map((tag) => tag.subgroup_tag_id) ?? []
        )
      );
      const newTagId = highestId + 1;

      const newTag: subgroup_tag = {
        subgroup_tag_id: newTagId, // Use the incremented ID
        tag_id: tag.tag_id,
        subgroup_id: selectedSubgroup.subgroup_id,
        subgroup_tag_name: tag.tag_name, // Assign tag_name to subgroup_tag_name
      };

      const updatedSubgroup = {
        ...selectedSubgroup,
        subgroup_tags: [...(selectedSubgroup.subgroup_tags ?? []), newTag],
      };

      const updatedAsset = {
        ...selectedAsset,
        subgroups: selectedAsset.subgroups.map((subgroup) =>
          subgroup.subgroup_id === selectedSubgroup.subgroup_id ? updatedSubgroup : subgroup
        ),
      };

      setAssets((prevAssets) =>
        prevAssets.map((asset) => (asset.asset_id === selectedAsset.asset_id ? updatedAsset : asset))
      );

      setSelectedSubgroup(updatedSubgroup);

      console.log(` "${tag.tag_id} "Tag "${tag.tag_name}" added to subgroup "${selectedSubgroup.subgroup_name}" with ID ${newTagId}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* Search and Sort Section */}
      <div className="w-full flex flex-row items-center gap-2">
        <SearchForm
          className="w-full"
          value={searchQuery}
          onInputChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tags..." // Updated placeholder
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

      {/* Subgroup Selection Section */}
      <div className="flex flex-row w-full gap-2">
        <Select
          onValueChange={(value) => {
            const subgroup = selectedAsset?.subgroups.find(
              (sub) => sub.subgroup_id === Number(value)
            );
            setSelectedSubgroup(subgroup ?? null);
          }}
        >
          <SelectTrigger className="w-full shadow-none">
            <SelectValue placeholder="Select a subgroup" />
          </SelectTrigger>
          <SelectContent>
            {selectedAsset?.subgroups.map((subgroup) => (
              <SelectItem
                key={subgroup.subgroup_id}
                value={subgroup.subgroup_id.toString()}
              >
                {subgroup.subgroup_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Add Subgroup Tag Button */}
        <TagDetails onAddTag={handleAddTag} />
      </div>

      {/* Tags Section */}
      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full">
        {selectedSubgroup ? (
          <div className="flex flex-col gap-2">
            {filteredTags.map((tag, index) => (
              <Button 
                key={index} 
                className="rounded-sm w-full flex flex-row justify-start"
                variant="outline"
              >
                {tag.subgroup_tag_name}
              </Button>
            ))}
            {filteredTags.length === 0 && (
              <p className="text-zinc-500">No tags match the search query.</p>
            )}
          </div>
        ) : (
          <p className="text-zinc-500">No subgroup selected.</p>
        )}
      </div>
    </div>
  );
}