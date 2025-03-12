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
  TagIcon,
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
import { createSubgroup } from "@/_actions/asset-actions";


interface SubgroupTagEditProps {
  selectedSubgroupTag: Subgroup_tag | null; // Update prop type
}

export default function SubgroupTagEdit({ selectedSubgroupTag }: SubgroupTagEditProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubgroupTags, setSelectedSubgroupTags] =
    React.useState<Subgroup_tag | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">(
    "newest"
  );
  const [loading, setLoading] = React.useState(false);
  const [subgroupTags, setSubgroupTags] = React.useState<Subgroup_tag[]>([]);
  const params = useParams();

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex flex-col justify-between items-start">
      
        <h2 className="text-lg font-semibold">Tag Editor</h2>
        {/* Display selected subgroup tag name */}
        {selectedSubgroupTag && (
          <span className="text-lg text-foreground flex flex-row items-center gap-2">
            {selectedSubgroupTag.subgroup_tag_name}
            <TagIcon className="w-5 h-5 text-foreground" />
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

        <Button
          variant="outline"
          size="sm"
          // onClick={handleAddSubgroup}
          disabled={loading}
        >
          <PlusCircleIcon className="w-4 h-4 mr-1" />
          Add Subgroup Tag
        </Button>
      </div>

      <div className="flex flex-row w-full gap-2">

      </div>

      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full overflow-y-auto">

      </div>
    </div>
  );
}