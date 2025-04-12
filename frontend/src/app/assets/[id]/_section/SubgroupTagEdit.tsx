"use client";

import * as React from "react";
import {
  CheckIcon,
  DocumentCheckIcon,
  TagIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Subgroup_tag } from "@/models/subgroup-tag";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import TemplateSelector from "@/app/assets/[id]/_section/_components/template-selection";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import AssignSubgroupTagVariable from "./_components/assign-subgroup_tag-variable";
import { assetAction } from "../_redux/asset-slice";
import FormulaSection from "./_components/formula-section";
import { Skeleton } from "@/components/ui/skeleton";
import { formulaClientService } from "@/_actions/formula-actions";
import {
  getVariableMappings,
  removeVariableMapping,
} from "@/_actions/formula-variable-actions";

interface SubgroupTagEditProps {
  selectedSubgroupTag: Subgroup_tag | null;
}

export default function SubgroupTagEdit({
  selectedSubgroupTag,
}: SubgroupTagEditProps) {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [formulaVariables, setFormulaVariables] = React.useState<
    Array<{ variable_name: string; variable_id?: number }>
  >([]);
  const [loadingVariables, setLoadingVariables] = React.useState(false);
  const [variableMappings, setVariableMappings] = React.useState<
    Record<number, any>
  >({});
  const [loadingMappings, setLoadingMappings] = React.useState(false);

  // Get state from Redux
  const childTags = useAppSelector((state) => state.assetState.childTags);
  const childTagsLoading = useAppSelector(
    (state) => state.assetState.childTagsLoading
  );

  // Get selectedFormulaId from Redux
  const selectedFormulaId = useAppSelector(
    (state) => state.assetState.selectedFormulaId
  );

  // Handle tag deselection
  const handleDeselectTag = () => {
    dispatch(assetAction.selectSubgroupTag(null));
  };

  React.useEffect(() => {
    async function fetchFormulaVariables() {
      if (selectedFormulaId) {
        setLoadingVariables(true);
        try {
          const variables = await formulaClientService.getFormulaVariables(
            selectedFormulaId
          );
          console.log("Fetched formula variables:", variables); // Added console log here
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

  // Fetch variable mappings when selected subgroup tag changes
  React.useEffect(() => {
    async function fetchVariableMappings() {
      if (selectedSubgroupTag) {
        setLoadingMappings(true);
        try {
          const mappings = await getVariableMappings(
            selectedSubgroupTag.subgroup_tag_id
          );
          console.log("Fetched variable mappings:", mappings); // Log the entire response

          // Convert array to object with variableId as key for easy lookup
          const mappingsMap = mappings.reduce(
            (acc: Record<number, any>, mapping: any) => {
              if (mapping.variable_id) {
                // Log each mapping to inspect its structure
                console.log("Individual mapping:", mapping);
                acc[mapping.variable_id] = mapping;
              }
              return acc;
            },
            {}
          );
          setVariableMappings(mappingsMap);
        } catch (error) {
          console.error("Error fetching variable mappings:", error);
          toast.error("Failed to fetch variable mappings");
        } finally {
          setLoadingMappings(false);
        }
      } else {
        setVariableMappings({});
      }
    }

    fetchVariableMappings();
  }, [selectedSubgroupTag]);

  // Add this refresh function to reload variable mappings
  const refreshVariableMappings = async () => {
    if (!selectedSubgroupTag) return;

    setLoadingMappings(true);
    try {
      const mappings = await getVariableMappings(
        selectedSubgroupTag.subgroup_tag_id
      );
      const mappingsMap = mappings.reduce(
        (acc: Record<number, any>, mapping: any) => {
          if (mapping.variable_id) {
            acc[mapping.variable_id] = mapping;
          }
          return acc;
        },
        {}
      );
      setVariableMappings(mappingsMap);
    } catch (error) {
      console.error("Error refreshing variable mappings:", error);
      toast.error("Failed to refresh variable mappings");
    } finally {
      setLoadingMappings(false);
    }
  };

  // Handle removing a variable mapping
  const handleRemoveMapping = async (variableId: number) => {
    if (!selectedSubgroupTag || !variableId) return;

    try {
      // Find the mapping ID from the variableMappings
      const mapping = variableMappings[variableId];
      if (!mapping || !mapping.mapping_id) {
        toast.error("Could not find mapping ID");
        return;
      }

      // Use the mapping_id instead of subgroupTagId and variableId
      await removeVariableMapping(mapping.mapping_id);

      // Update state after successful removal to immediately reflect in the UI
      setVariableMappings((prev) => {
        const newMappings = { ...prev };
        delete newMappings[variableId];
        return newMappings;
      });

      toast.success("Tag assignment removed successfully");
    } catch (error) {
      console.error("Error removing variable mapping:", error);
      toast.error("Failed to remove tag assignment");
    }
  };

  // Helper function to safely get the tag name from a mapping
  const getTagNameFromMapping = (mapping: any): string => {
    // Log the mapping to see its structure
    console.log("Getting tag name from mapping:", mapping);

    if (!mapping) return "Unknown Tag";

    // Check all possible paths where the tag name might be
    if (mapping.mapped_tag_name) return mapping.mapped_tag_name;
    if (mapping.assigned_tag?.subgroup_tag_name)
      return mapping.assigned_tag.subgroup_tag_name;
    if (mapping.tag_name) return mapping.tag_name;
    if (mapping.subgroup_tag_name) return mapping.subgroup_tag_name;
    if (mapping.name) return mapping.name;

    // If we get this far, try to stringify the whole object for debugging
    try {
      return `Tag: ${JSON.stringify(mapping)}`;
    } catch {
      return "Assigned Tag";
    }
  };

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

      <div className="w-full ">
        <TemplateSelector />
      </div>
      
      {/* Display formula subgroup tags */}
      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full overflow-y-auto">
        {selectedSubgroupTag ? (
          <>
            {/* FormulaSection moved inside the selectedSubgroupTag conditional */}
            <FormulaSection isDisabled={!selectedSubgroupTag} />

            {/* Display formula variables with mappings */}
            {loadingVariables || loadingMappings ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : formulaVariables.length > 0 ? (
              <div className="flex flex-col gap-2 ">
                {formulaVariables.map((variable, index) => (
                  <div
                    key={index}
                    className="inline-flex w-full items-center gap-2"
                  >
                    <div className="p-2 text-sm border border-border rounded-md bg-background font-medium w-[100px]">
                      {variable.variable_name}
                    </div>
                    <span>=</span>
                    {variable.variable_id &&
                    variableMappings[variable.variable_id] ? (
                      <div className="flex items-center gap-2 p-2 text-sm border border-blue-200 rounded-md bg-blue-50 text-blue-700 flex-grow">
                        <TagIcon className="w-4 h-4" />
                        <span className="flex-grow">
                          {getTagNameFromMapping(
                            variableMappings[variable.variable_id]
                          )}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveMapping(variable.variable_id!)
                          }
                          className="p-1 hover:bg-blue-100 rounded-full cursor-pointer"
                        >
                          <XMarkIcon className="w-4 h-4 text-blue-700" />
                        </button>
                      </div>
                    ) : (
                      <AssignSubgroupTagVariable
                        buttonText={`Assign tag to ${variable.variable_name}`}
                        variableName={variable.variable_name}
                        variableId={variable.variable_id}
                        refreshChildTags={refreshVariableMappings} // Add this prop
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : selectedFormulaId ? (
              <div className="text-sm text-muted-foreground mt-4">
                No variables found for this formula.
              </div>
            ) : (
              <div className="flex flex-row text-muted-foreground w-full h-full align-middle items-center justify-center">
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
    </div>
  );
}
