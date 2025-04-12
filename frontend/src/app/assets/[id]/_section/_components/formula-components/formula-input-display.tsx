import * as React from "react";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { assetAction } from "../../../_redux/asset-slice";
import { updateSubgroupTagFormula } from "@/_actions/subgroup-tag-actions";
import { formulaClientService } from "@/_actions/formula-actions";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { assignTemplate } from "@/_actions/template-actions"; // Import the updated assignTemplate

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
      if (selectedSubgroupTag?.subgroup_tag_id && selectedSubgroupTag?.formula_id) {
        try {
          setIsLoading(true);
          const formulaData = await formulaClientService.getFormulaBySubgroupTagId(selectedSubgroupTag.subgroup_tag_id);
          if (formulaData && formulaData.formula_expression) {
            dispatch(assetAction.setFormulaInput(formulaData.formula_expression));
            dispatch(assetAction.setSelectedFormulaId(formulaData.formula_id));
          }
        } catch (error) {
          console.error("Error fetching formula for tag:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (selectedSubgroupTag && !selectedSubgroupTag.formula_id) {
        // Clear formula if the tag has no formula
        dispatch(assetAction.setFormulaInput(""));
        dispatch(assetAction.setSelectedFormulaId(null));
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
    <div className="flex w-full justify-between items-center bg-background rounded-md border border-input">
      <div className="truncate text-sm flex-1 p-2">
        {isLoading ? (
          <Skeleton className="h-4 rounded-xs w-full" />
        ) : formulaInput ? (
          <span className="font-medium pl-2">{formulaInput}</span>
        ) : (
          <span className="text-muted-foreground pl-2">
            Select or create a formula...
          </span>
        )}
      </div>
      <div className="flex gap-2 pr-1">
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
