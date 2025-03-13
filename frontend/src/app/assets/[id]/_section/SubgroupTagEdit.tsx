"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { SearchForm } from "@/components/user/search-form";
import {
  AdjustmentsVerticalIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Subgroup_tag } from "@/models/subgroup-tag";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import TemplateSelector from "./TemplateSelector";

export default function SubgroupTagEdit({
  selectedSubgroupTag,
  assetId,
}: {
  selectedSubgroupTag: Subgroup_tag | null;
  assetId: number;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const state = useAppSelector((state) => state.assetState);
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">(
    "newest"
  );
  const [loading, setLoading] = React.useState(false);
  const [subgroupTags, setSubgroupTags] = React.useState<Subgroup_tag[]>([]);
  const params = useParams();
  const dispatch = useAppDispatch(); // Add this line to use dispatch

  // Add this function to handle tag deselection
  const handleDeselectTag = () => {
    dispatch({ type: "assetSlice/selectSubgroupTag", payload: null });
  };

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex flex-col justify-between items-start gap-1">
        <h2 className="text-lg font-semibold">Tag Editor</h2>
        {/* Display selected subgroup tag name */}
        {state.selectedSubgroupTagId && (
          <span className="text-sm text-blue-600 bg-blue-100 flex flex-row items-center gap-2 pl-4 pr-2 py-1 rounded-full ">
            {/* <TagIcon className="w-4 h-4" /> */}
            {state.selectedSubgroupTagId.subgroup_tag_name}
            <XCircleIcon
              className="w-4 h-4 cursor-pointer hover:text-blue-800"
              onClick={handleDeselectTag}
            />
          </span>
        )}
      </div>

      <div className="w-full flex flex-row items-center gap-2">
        <SearchForm
          className="w-full"
          value={searchQuery}
          onInputChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tags..."
        />

        <DropdownMenu>
          <DropdownMenuTrigger className="px-2 py-1 h-full flex items-center gap-1 border border-zinc-200 rounded-md text-foreground text-sm">
            <AdjustmentsVerticalIcon className="w-4 h-4 text-fo gap-2reground" />
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

        <Button
          variant="default"
          size="sm"
          // onClick={handleAddSubgroup}
          disabled={loading}
        >
          <PlusCircleIcon className="w-4 h-4 mr-1" />
          Add Subgroup Tag
        </Button>
      </div>

      <TemplateSelector />

      {/* Display formula subgroup tags */}
      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full overflow-y-auto">
        {state.selectedSubgroupTagId ? (
          <Input placeholder="Make a formula..." className="bg-background" />
        ) : (
          <span className="text-md justify-center flex flex-row text-center text-muted-foreground h-full items-center">
            Select a subgroup tag first
          </span>
        )}
      </div>
    </div>
  );
}
