"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/user/search-form";
import {
  AdjustmentsVerticalIcon,
  CheckIcon,
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
import AssignSubgroupTagVariable from "./_components/assign-subgroup_tag-variable";
import { getChildTagsByParentId } from "@/_services/subgroup-tag-service";
import { assetAction } from "../_redux/asset-slice";
import FormulaSection from "./_components/formula-section";
import { updateSubgroupTagFormula } from "@/_actions/subgroup-tag-actions";
import { exportSubgroupTagDataToExcel } from "@/_services/subgroup-tag-service";
import { Skeleton } from "@/components/ui/skeleton";
import { formulaClientService } from "@/_services/formula-service";

interface SubgroupTagEditProps {
  selectedSubgroupTag: Subgroup_tag | null;
}

export default function SubgroupTagEdit({
  selectedSubgroupTag,
}: SubgroupTagEditProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">(
    "newest"
  );
  const params = useParams();
  const dispatch = useAppDispatch();
  const [formulaVariables, setFormulaVariables] = React.useState<Array<{ variable_name: string, variable_id?: number }>>([]);
  const [loadingVariables, setLoadingVariables] = React.useState(false);

  // Get state from Redux
  const childTags = useAppSelector((state) => state.assetState.childTags);
  const childTagsLoading = useAppSelector(
    (state) => state.assetState.childTagsLoading
  );

  // Get selectedFormulaId from Redux
  const selectedFormulaId = useAppSelector((state) => state.assetState.selectedFormulaId);

  // Handle tag deselection
  const handleDeselectTag = () => {
    dispatch(assetAction.selectSubgroupTag(null));
  };

  // Add to database handler function
  // const handleAddToDatabase = async () => {
  //   if (!selectedSubgroupTag) {
  //     toast.error("Please select a subgroup tag first");
  //     return;
  //   }

  //   try {
  //     const result = await exportSubgroupTagDataToExcel(
  //       selectedSubgroupTag.subgroup_tag_id
  //     );
  //     if (result.success) {
  //       toast.success("Data exported successfully");
  //     } else {
  //       toast.error(result.error || "Failed to export data");
  //     }
  //   } catch (error) {
  //     console.error("Error exporting data:", error);
  //     toast.error("An unexpected error occurred");
  //   }
  // };

  // // Extract the child tags fetching logic into a reusable function
  // const fetchChildTags = React.useCallback(async () => {
  //   if (selectedSubgroupTag) {
  //     dispatch(assetAction.setChildTagsLoading(true));
  //     try {
  //       const tags = await getChildTagsByParentId(
  //         selectedSubgroupTag.subgroup_tag_id
  //       );
  //       dispatch(assetAction.setChildTags(tags));
  //     } catch (error) {
  //       console.error("Error fetching child tags:", error);
  //       toast.error("Failed to fetch child tags");
  //       dispatch(assetAction.setChildTags([]));
  //     } finally {
  //       dispatch(assetAction.setChildTagsLoading(false));
  //     }
  //   } else {
  //     dispatch(assetAction.setChildTags([]));
  //   }
  // }, [selectedSubgroupTag, dispatch]);

  // Fetch formula variables when selectedFormulaId changes

  React.useEffect(() => {
    async function fetchFormulaVariables() {
      if (selectedFormulaId) {
        setLoadingVariables(true);
        try {
          const variables = await formulaClientService.getFormulaVariables(selectedFormulaId);
          setFormulaVariables(variables);
        } catch (error) {
          console.error("Error fetching formula variables:", error);
          toast.error("Failed to fetch formula variables");
          setFormulaVariables([]);
        } finally {
          setLoadingVariables(false);
        }
      } else {
        setFormulaVariables([]);
      }
    }

    fetchFormulaVariables();
  }, [selectedFormulaId]);

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
            {/* Use the FormulaSection component */}
            <FormulaSection isDisabled={!selectedSubgroupTag} />

            {/* Display formula variables without assignment */}
            {loadingVariables ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : formulaVariables.length > 0 ? (
              <div className="flex flex-col gap-2 ">
                {formulaVariables.map((variable, index) => (
                  <div key={index} className="inline-flex w-full items-center gap-2">
                    <div className="p-2 text-sm border border-border rounded-md bg-background">
                      {variable.variable_name}
                    </div>
                    <span>=</span>
                    <AssignSubgroupTagVariable
                     buttonText={`Assign tag to ${variable.variable_name}`}
                     variableName={variable.variable_name} // Pass the variable name
                     variableId={variable.variable_id} // Add the variable ID
                     />
                  </div>
                ))}
              </div>
            ) : selectedFormulaId ? (
              <div className="text-sm text-muted-foreground mt-4">
                No variables found for this formula.
              </div>
            ) : (
              <div className="text-sm text-muted-foreground mt-4">
                Select a formula to see its variables.
              </div>
            )}
          </>
        ) : (
          <span className="text-md justify-center flex flex-row text-center text-muted-foreground h-full items-center">
            Select a subgroup tag first
          </span>
        )}
      </div>

      <Button
        variant="default"
        className="cursor-pointer"
        // onClick={handleAddToDatabase}
        disabled={!selectedSubgroupTag}
      >
        <CheckIcon className="w-4 h-4" />
        <span>Save Changes</span>
      </Button>
    </div>
  );
}