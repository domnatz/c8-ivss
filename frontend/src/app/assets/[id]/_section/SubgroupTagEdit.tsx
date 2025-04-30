"use client";

import * as React from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import TemplateSelector from "@/app/assets/[id]/_section/_components/template-selection";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import { assetAction } from "../_redux/asset-slice";
import FormulaSection from "./_components/formula-section";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchFormulaVariables } from "@/_actions/formula-actions";
import {
  getVariableMappings,
  removeVariableMapping,
} from "@/_actions/formula-variable-actions";
import { variable_mappings } from "@/models/variable_mappings";
import VariablesList from "./_components/variable-components/VariablesList";

interface SubgroupTagEditProps {
  selectedSubgroupTag: Subgroup_tag | null;
}

export default function SubgroupTagEdit({
  selectedSubgroupTag,
}: SubgroupTagEditProps) {
  const params = useParams();
  const dispatch = useAppDispatch();

  // Update state types to match the imported models
  const [formulaVariables, setFormulaVariables] = React.useState<any[]>([]);
  const [loadingVariables, setLoadingVariables] = React.useState(false);
  const [variableMappings, setVariableMappings] = React.useState<
    Record<
      number,
      variable_mappings & { tag_name?: string; subgroup_tag_name?: string }
    >
  >({});
  const [loadingMappings, setLoadingMappings] = React.useState(false);

  const selectedFormulaId = useAppSelector(
    (state) => state.assetState.selectedFormulaId
  );

  const handleDeselectTag = () => {
    dispatch(assetAction.selectSubgroupTag(null));
  };

  const refreshVariableMappings = async () => {
    if (!selectedSubgroupTag) return;

    setLoadingMappings(true);
    try {
      const mappings = await getVariableMappings(
        selectedSubgroupTag.subgroup_tag_id
      );
      const mappingsMap = mappings.reduce(
        (
          acc: Record<
            number,
            variable_mappings & {
              tag_name?: string;
              subgroup_tag_name?: string;
            }
          >,
          mapping: any
        ) => {
          if (mapping.variable_id) acc[mapping.variable_id] = mapping;
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

  const handleRemoveMapping = async (variableId: number) => {
    if (!selectedSubgroupTag || !variableId) return;

    try {
      const mapping = variableMappings[variableId];
      if (!mapping || !mapping.mapping_id) {
        toast.error("Could not find mapping ID");
        return;
      }

      await removeVariableMapping(mapping.mapping_id);
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

  React.useEffect(() => {
    async function fetchFormulaVars() {
      if (selectedFormulaId) {
        setLoadingVariables(true);
        try {
          const result = await fetchFormulaVariables(selectedFormulaId);
          if (result.success && result.data) {
            setFormulaVariables(result.data);
          } else {
            toast.error("Failed to fetch formula variables");
            setFormulaVariables([]);
          }
        } catch (error) {
          toast.error("Failed to fetch formula variables");
          setFormulaVariables([]);
        } finally {
          setLoadingVariables(false);
        }
      } else {
        setFormulaVariables([]);
      }
    }

    fetchFormulaVars();
  }, [selectedFormulaId]);

  React.useEffect(() => {
    refreshVariableMappings();
  }, [selectedSubgroupTag]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex flex-col justify-between items-start gap-1">
        <div className="flex flex-col justify-between w-full">
          <h2 className="text-lg font-semibold flex flex-wrap items-center gap-2">
            Tag Editor
            {selectedSubgroupTag && (
              <span className="text-sm text-blue-600 bg-blue-100 flex flex-row items-center gap-2 p-1 pl-4 pr-2 min-w-[150px] rounded-full overflow-hidden">
                {selectedSubgroupTag.subgroup_tag_name}
                <XCircleIcon
                  className="w-4 h-4 cursor-pointer hover:text-blue-800 flex-shrink-0"
                  onClick={handleDeselectTag}
                />
              </span>
            )}
          </h2>
          <span className="text-xs text-muted-foreground">
            Select a formula and assign tags to its variables
          </span>
        </div>
      </div>

      <div className="w-full">
        <TemplateSelector />
      </div>

      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full overflow-y-auto">
        {selectedSubgroupTag ? (
          <>
            <FormulaSection isDisabled={!selectedSubgroupTag} />
            {loadingVariables || loadingMappings ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : formulaVariables.length > 0 ? (
              <VariablesList
                variables={formulaVariables}
                mappings={variableMappings}
                onRemoveMapping={handleRemoveMapping}
                onAssignTag={refreshVariableMappings}
              />
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
