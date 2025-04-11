import * as React from "react";
import { Formula } from "@/models/formula";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/user/search-form";
import { TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { formulaService, formulaClientService } from "@/_actions/formula-actions";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { assetAction } from "../../../_redux/asset-slice";
import { toast } from "react-toastify";
import { updateSubgroupTagFormula } from "@/_actions/subgroup-tag-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SelectFormulaDialogProps {
  isDisabled?: boolean;
}

export const SelectFormulaDialog: React.FC<SelectFormulaDialogProps> = ({
  isDisabled = false,
}) => {
  // Get states from Redux
  const formulas = useAppSelector((state) => state.assetState.formulas);
  const formulasLoading = useAppSelector(
    (state) => state.assetState.formulasLoading
  );
  const selectedSubgroupTag = useAppSelector(
    (state) => state.assetState.selectedSubgroupTag
  );

  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFormulaForDelete, setSelectedFormulaForDelete] =
    React.useState<number | undefined>(undefined);
  const [selectedFormulaToApply, setSelectedFormulaToApply] =
    React.useState<Formula | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const dispatch = useAppDispatch();

  const loadFormulas = async () => {
    await formulaClientService.loadFormulas(dispatch);
  };

  const handleOpenChange = async (open: boolean) => {
    setOpen(open);
    if (open && formulas.length === 0) {
      await loadFormulas();
    }
  };

  const filteredFormulas = React.useMemo(() => {
    if (!searchQuery) return formulas;
    return formulas.filter((formula) =>
      formula.formula_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [formulas, searchQuery]);

  const handleDeleteFormula = async () => {
    if (!selectedFormulaForDelete) {
      toast.error("Please select a formula to delete");
      return;
    }

    setIsDeleting(true);

    try {
      await formulaService.deleteFormula(selectedFormulaForDelete);

      // Update local state to remove deleted formula
      dispatch(assetAction.removeFormula(selectedFormulaForDelete));

      // Reset selection
      setSelectedFormulaForDelete(undefined);
      setSelectedFormulaToApply(null);

      toast.success("Formula deleted successfully");
    } catch (error) {
      console.error("Error deleting formula:", error);
      toast.error("Failed to delete formula");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApplySelectedFormula = async () => {
    if (!selectedFormulaToApply) {
      toast.error("Please select a formula to apply");
      return;
    }

    try {
      // First, if we have a selected tag, update the backend first
      if (selectedSubgroupTag && selectedFormulaToApply.formula_id) {
        console.log(
          `Updating subgroup tag ${selectedSubgroupTag.subgroup_tag_id} with formula ${selectedFormulaToApply.formula_id}`
        );

        // Update the backend first
        await updateSubgroupTagFormula(
          selectedSubgroupTag.subgroup_tag_id,
          selectedFormulaToApply.formula_id
        );

        // Update local state to match what's now in the backend
        const updatedTag = {
          ...selectedSubgroupTag,
          formula_id: selectedFormulaToApply.formula_id,
        };

        // Update Redux with the updated tag
        dispatch(assetAction.selectSubgroupTag(updatedTag));

        // Explicitly update the formula display in UI
        dispatch(assetAction.setFormulaInput(selectedFormulaToApply.formula_expression));
        dispatch(assetAction.setSelectedFormulaId(selectedFormulaToApply.formula_id));

        // Refresh the UI by refetching the formula to ensure consistency
        const refreshedFormula = await formulaService.getFormulaById(
          selectedFormulaToApply.formula_id
        );
        dispatch(
          assetAction.setFormulaInput(refreshedFormula.formula_expression)
        );

        toast.success("Formula assigned to tag successfully");
      } else {
        // No tag selected, just update the local UI
        dispatch(assetAction.setFormulaInput(selectedFormulaToApply.formula_expression));
        dispatch(assetAction.setSelectedFormulaId(selectedFormulaToApply.formula_id || null));
      }
      
      setOpen(false);
    } catch (error) {
      console.error("Error updating formula for tag:", error);
      toast.error("Failed to assign formula to tag");
    }
  };

  const handleSelectFormula = (formula: Formula) => {
    setSelectedFormulaToApply(formula);
    // Also set the formula ID for deletion when selecting a formula
    setSelectedFormulaForDelete(formula.formula_id || undefined);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger disabled={isDisabled} asChild>
        <Button variant="outline" size="sm">
          Select
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Formula</DialogTitle>
          <DialogDescription>
            Choose a formula from the list below to use in your calculation.
          </DialogDescription>
        </DialogHeader>

        <div className="inline-flex gap-2 w-full">
          <SearchForm
            placeholder="Search formulas..."
            value={searchQuery}
            onInputChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <Button
            variant="destructive"
            disabled={!selectedFormulaForDelete || isDeleting}
            onClick={handleDeleteFormula}
            className="flex-1"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {formulasLoading ? (
            <div className="py-4 text-center text-muted-foreground">
              Loading formulas...
            </div>
          ) : filteredFormulas.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filteredFormulas.map((formula) => (
                <div
                  key={formula.formula_id}
                  className={`flex items-center p-2 px-4 border rounded-md justify-between font-medium text-sm cursor-pointer hover:bg-muted ${
                    selectedFormulaToApply?.formula_id === formula.formula_id
                      ? "bg-primary/10 border-primary"
                      : "border-zinc-200 bg-background"
                  } transition-colors`}
                  onClick={() => handleSelectFormula(formula)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{formula.formula_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formula.formula_expression}
                    </span>
                  </div>
                  {selectedFormulaToApply?.formula_id ===
                    formula.formula_id && (
                    <CheckIcon className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              {searchQuery
                ? "No formulas match your search."
                : "No formulas found. Create one first."}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 w-full">
          <Button
            variant="default"
            disabled={!selectedFormulaToApply}
            onClick={handleApplySelectedFormula}
            className="flex-1"
          >
            <CheckIcon className="h-4 w-4 mr-2" />
            Apply Formula
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
