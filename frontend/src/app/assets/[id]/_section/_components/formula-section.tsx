"use client";

import * as React from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import {
  formulaService,
} from "@/_actions/formula-actions";
import { assetAction } from "../../_redux/asset-slice";
import { toast } from "react-toastify";
import { FormulaDisplay } from "./formula-components/formula-input-display";
import { SelectFormulaDialog } from "./formula-components/select-formula-dialog";
import { CreateFormulaDialog } from "./formula-components/create-formula-dialog";

interface FormulaSectionProps {
  isDisabled?: boolean;
}

export default function FormulaSection({
  isDisabled = false,
}: FormulaSectionProps) {
  const dispatch = useAppDispatch();
  const selectedSubgroupTag = useAppSelector(
    (state) => state.assetState.selectedSubgroupTag
  );

  // Load formula when a subgroup tag is selected
  React.useEffect(() => {
    const loadFormula = async () => {
      if (selectedSubgroupTag?.formula_id) {
        try {
          console.log(
            "Loading formula for tag:",
            selectedSubgroupTag.subgroup_tag_id,
            "formula ID:",
            selectedSubgroupTag.formula_id
          );

          // Fetch the formula from backend
          const formula = await formulaService.getFormulaById(
            selectedSubgroupTag.formula_id
          );

          console.log("Loaded formula:", formula);

          // Update the formula input display
          dispatch(assetAction.setFormulaInput(formula.formula_expression));

          // Store the selected formula ID in Redux
          dispatch(
            assetAction.setSelectedFormulaId(formula.formula_id ?? null)
          );
        } catch (error) {
          console.error("Error loading formula for selected tag:", error);
          toast.error("Failed to load formula for this tag");
        }
      } else {
        // Clear formula input if no formula is assigned to the selected tag
        dispatch(assetAction.setFormulaInput(""));
        dispatch(assetAction.setSelectedFormulaId(null));
      }
    };

    loadFormula();
  }, [
    selectedSubgroupTag?.subgroup_tag_id,
    selectedSubgroupTag?.formula_id,
    dispatch,
  ]);

  return (
    <div className="inline-flex flex-row w-full gap-2 items-center mb-2">
      <FormulaDisplay isDisabled={isDisabled} />
      <div className="flex gap-2">
        <SelectFormulaDialog isDisabled={isDisabled} />
        <CreateFormulaDialog isDisabled={isDisabled} />
      </div>
    </div>
  );
}
