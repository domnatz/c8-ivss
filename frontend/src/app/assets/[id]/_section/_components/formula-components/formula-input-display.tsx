import * as React from "react";
import { Button } from "@/components/ui/button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { assetAction } from "../../../_redux/asset-slice";
import { updateSubgroupTagFormula } from "@/_actions/subgroup-tag-actions";
import { toast } from "react-toastify";

interface FormulaDisplayProps {
  isDisabled?: boolean;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  isDisabled = false,
}) => {
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const formulaInput = useAppSelector((state) => state.assetState.formulaInput);
  const selectedSubgroupTag = useAppSelector(
    (state) => state.assetState.selectedSubgroupTag
  );

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
    <div className="flex w-full justify-between items-center p-2 bg-background rounded-md border border-input">
      <div className="truncate text-sm">
        {formulaInput ? (
          <span className="font-medium pl-2">{formulaInput}</span>
        ) : (
          <span className="text-muted-foreground pl-2">
            Select or create a formula...
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {formulaInput && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFormula}
            disabled={isDisabled}
          >
            <XMarkIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
