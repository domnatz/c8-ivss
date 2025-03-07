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
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Subgroup, Asset, subgroup_tag } from "@/app/_sections/app-sidebar"; 
import { TagDetails, Tags } from "./tagsDetails";

interface SubgroupEditProps {
  selectedAsset: Asset | null;
}

export default function SubgroupEdit({ selectedAsset }: SubgroupEditProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubgroup, setSelectedSubgroup] = React.useState<Subgroup | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest");

  React.useEffect(() => {
    if (selectedAsset) {
    }
  }, [selectedAsset]);

  React.useEffect(() => {
  }, [selectedSubgroup]);

  const filteredTags = selectedSubgroup
  ? (selectedSubgroup.subgroup_tags ?? [])
      .filter((tag) =>
        tag.subgroup_tag_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => (sortOrder === "newest" ? b.subgroup_tag_id - a.subgroup_tag_id : a.subgroup_tag_id - b.subgroup_tag_id))
  : [];


  const handleAddTag = (tag: Tags) => {
    if (selectedSubgroup && selectedAsset) {
      const highestId = Math.max(
        0,
        ...selectedAsset.subgroups.flatMap((subgroup) =>
          subgroup.subgroup_tags?.map((tag) => tag.subgroup_tag_id) ?? []
        )
      );
      const newTagId = highestId + 1;

      const newTag: subgroup_tag = {
        subgroup_tag_id: newTagId,
        tag_id: tag.tag_id,
        subgroup_id: selectedSubgroup.subgroup_id,
        subgroup_tag_name: tag.tag_name,
      };

      const updatedSubgroup = {
        ...selectedSubgroup,
        subgroup_tags: [...(selectedSubgroup.subgroup_tags ?? []), newTag],
      };

      setSelectedSubgroup(updatedSubgroup);
    }
  };

  if (!selectedAsset) {
    return <p>Loading asset details...</p>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-2">
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
  onValueChange={(value) => {
    const subgroup = selectedAsset?.subgroups.find(
      (sub) => sub.subgroup_id === Number(value) // Ensure value is converted to a number
    );
    setSelectedSubgroup(subgroup ?? null);
  }}
>
  <SelectTrigger className="w-full shadow-none">
    <SelectValue placeholder="Select a subgroup" />
  </SelectTrigger>
  <SelectContent>
    {selectedAsset?.subgroups.map((subgroup) => (
      <SelectItem key={subgroup.subgroup_id} value={subgroup.subgroup_id.toString()}>
        {subgroup.subgroup_name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
        <TagDetails onAddTag={handleAddTag} />
      </div>

      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full">
       {selectedSubgroup ? (
  <div>
    <h2 className="text-lg font-bold mb-4">{selectedSubgroup.subgroup_name}</h2>
    {filteredTags.length > 0 ? (
      filteredTags.map((tag) => (
        <Button key={tag.subgroup_tag_id} variant="outline">
          {tag.subgroup_tag_name}
        </Button>
      ))
    ) : (
      <p>No tags found for this subgroup.</p>
    )}
  </div>
) : (
  <p>No subgroup selected.</p>
)}
      </div>
    </div>
  );
}