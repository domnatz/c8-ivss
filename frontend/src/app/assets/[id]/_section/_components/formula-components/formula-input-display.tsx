import * as React from "react";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { assetAction } from "../../../_redux/asset-slice";
import { updateSubgroupTagFormula } from "@/_actions/subgroup-tag-actions";
import { fetchFormulaBySubgroupTagId } from "@/_actions/formula-actions";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormulaDisplayProps {
  isDisabled?: boolean;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  isDisabled = false,
}) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Get state from Redux
  const formulaInput = useAppSelector((state) => state.assetState.formulaInput);
  const selectedSubgroupTag = useAppSelector(
    (state) => state.assetState.selectedSubgroupTag
  );

  // Fetch formula when selected subgroup tag changes
  React.useEffect(() => {
    const fetchFormulaForTag = async () => {
      // If no subgroup tag is selected, clear the formula
      if (!selectedSubgroupTag?.subgroup_tag_id) {
        dispatch(assetAction.setFormulaInput(""));
        dispatch(assetAction.setSelectedFormulaId(null));
        return;
      }
      
      setIsLoading(true);
      try {
        // Always fetch from the API when we have a tag ID
        const result = await fetchFormulaBySubgroupTagId(selectedSubgroupTag.subgroup_tag_id);
        
        if (result.success && result.data?.formula_expression) {
          dispatch(assetAction.setFormulaInput(result.data.formula_expression));
          dispatch(assetAction.setSelectedFormulaId(result.data.formula_id));
        } else {
          // No formula found for this tag in the database
          dispatch(assetAction.setFormulaInput(""));
          dispatch(assetAction.setSelectedFormulaId(null));
        }
      } catch (error) {
        console.error("Error fetching formula for tag:", error);
        // On error, clear the formula display
        dispatch(assetAction.setFormulaInput(""));
        dispatch(assetAction.setSelectedFormulaId(null));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormulaForTag();
  }, [selectedSubgroupTag, dispatch]);

  const clearFormula = async () => {
    try {
      // If there is a selected subgroup tag, update it in the backend
      if (selectedSubgroupTag?.subgroup_tag_id) {
        // Pass a number or undefined to match the expected type
        await updateSubgroupTagFormula(
          selectedSubgroupTag.subgroup_tag_id,
          null as any  // This cast will allow null to pass through
        );
   // Update the local state to match the backend
        const updatedTag = {
          ...selectedSubgroupTag,
          formula_id: null,  // Keep using null as before
        };
        
        // Update Redux with the updated tag
        dispatch(assetAction.selectSubgroupTag(updatedTag));
      }
      
      // Clear the formula input
      dispatch(assetAction.setFormulaInput(""));
      dispatch(assetAction.setSelectedFormulaId(null)); // Keep using null as before
      
      toast.success("Formula removed from tag");
    } catch (error) {
      console.error("Error clearing formula:", error);
      toast.error("Failed to remove formula from tag");
    }
  };

  return (
    <div className="flex w-full justify-between items-center bg-background rounded-md border border-input" style={{ minWidth: "200px" }}>
      <div className="truncate text-sm flex-1 p-2 overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-4 rounded-xs w-full" />
        ) : formulaInput ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium pl-2 block truncate">{formulaInput}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formulaInput}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground pl-2">
            Select or create a formula...
          </span>
        )}
      </div>
      <div className="flex-shrink-0 flex gap-2 pr-1">
        {formulaInput && !isLoading && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFormula}
            disabled={isDisabled}
            className="hover:bg-background hover:text-red-500 cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
