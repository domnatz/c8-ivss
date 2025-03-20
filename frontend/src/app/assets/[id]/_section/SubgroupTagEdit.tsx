"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/user/search-form";
import {
  AdjustmentsVerticalIcon,
  DocumentCheckIcon,
  TagIcon,
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
import TemplateSelector from "@/app/assets/[id]/_section/_components/template-selection";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import AddSubgroupTagButton from "./_components/add-subgroup-tag-button";
import { getChildTagsByParentId } from "@/_services/subgroup-tag-service"; 
import { assetAction } from "../_redux/asset-slice";
import FormulaSection from "./_components/formula-section";

interface SubgroupTagEditProps {
  selectedSubgroupTag: Subgroup_tag | null;
}

export default function SubgroupTagEdit({
  selectedSubgroupTag,
}: SubgroupTagEditProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest");
  const params = useParams();
  const dispatch = useAppDispatch();

  // Get state from Redux
  const childTags = useAppSelector((state) => state.assetState.childTags);
  const childTagsLoading = useAppSelector(
    (state) => state.assetState.childTagsLoading
  );

  // Handle tag deselection
  const handleDeselectTag = () => {
    dispatch(assetAction.selectSubgroupTag(null));
  };

  // Extract the child tags fetching logic into a reusable function
  const fetchChildTags = React.useCallback(async () => {
    if (selectedSubgroupTag) {
      dispatch(assetAction.setChildTagsLoading(true));
      try {
        const tags = await getChildTagsByParentId(
          selectedSubgroupTag.subgroup_tag_id
        );
        dispatch(assetAction.setChildTags(tags));
      } catch (error) {
        console.error("Error fetching child tags:", error);
        toast.error("Failed to fetch child tags");
        dispatch(assetAction.setChildTags([]));
      } finally {
        dispatch(assetAction.setChildTagsLoading(false));
      }
    } else {
      dispatch(assetAction.setChildTags([]));
    }
  }, [selectedSubgroupTag, dispatch]);

  // Use the function in useEffect
  React.useEffect(() => {
    fetchChildTags();
  }, [fetchChildTags]);

  // Filter child tags based on search query
  const filteredChildTags = childTags.filter((tag) =>
    tag.subgroup_tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort child tags based on sortOrder
  const sortedChildTags = [...filteredChildTags].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.subgroup_tag_id - a.subgroup_tag_id;
    } else {
      return a.subgroup_tag_id - b.subgroup_tag_id;
    }
  });

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex flex-col justify-between items-start gap-1">
        <div className="flex flex-wrap gap-2 sm:flex-row justify-between w-full">
          <h2 className="text-lg font-semibold flex flex-row items-center gap-2">
            Tag Editor
            {/* Display selected subgroup tag name */}
            {selectedSubgroupTag && (
              <span className="text-sm text-blue-600 bg-blue-100 flex flex-row items-center gap-2 p-1 pl-4 pr-2  rounded-full ">
                {selectedSubgroupTag.subgroup_tag_name}
                <XCircleIcon
                  className="w-4 h-4 cursor-pointer hover:text-blue-800"
                  onClick={handleDeselectTag}
                />
              </span>
            )}
          </h2>
          <AddSubgroupTagButton refreshChildTags={fetchChildTags} />
        </div>
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
      </div>

      <div className="w-full ">
        <TemplateSelector />
      </div>

      {/* Display formula subgroup tags */}
      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full overflow-y-auto">
        {selectedSubgroupTag ? (
          <>
            {/* Use the new FormulaSection component */}
            <FormulaSection isDisabled={!selectedSubgroupTag} />

            {/* Display child tags */}
            {childTagsLoading ? (
              <div className="py-4 text-center text-muted-foreground">
                Loading child tags...
              </div>
            ) : sortedChildTags.length > 0 ? (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-svh">
                {sortedChildTags.map((tag) => (
                  <div
                    key={tag.subgroup_tag_id}
                    className="flex items-center justify-between p-2 bg-background rounded-md border border-zinc-200 hover:bg-muted transition-colors"
                  >
                    <span className="flex flex-row justify-between w-full px-2 items-center gap-2 font-medium text-sm">
                      {tag.subgroup_tag_name}
                      <TagIcon className="w-4 h-4 text-blue-500" />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No child tags found for this subgroup tag
              </div>
            )}
          </>
        ) : (
          <span className="text-md justify-center flex flex-row text-center text-muted-foreground h-full items-center">
            Select a subgroup tag first
          </span>
        )}
      </div>

      <Button variant="default" className="cursor-pointer">
        <DocumentCheckIcon className="w-4 h-4 mr-2" />
        <span>Add to database</span>
      </Button>
    </div>
  );
}
