"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Formula } from "@/models/formula";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import {
  formulaClientService,
  formulaService,
} from "@/_services/formula-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { assetAction } from "../../_redux/asset-slice";
import { toast } from "react-toastify";
import { updateSubgroupTagFormula } from "@/_actions/subgroup-tag-actions";
import { XMarkIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { SearchForm } from "@/components/user/search-form";

interface FormulaSectionProps {
  isDisabled?: boolean;
}

export default function FormulaSection({
  isDisabled = false,
}: FormulaSectionProps) {
  const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();

  // Get state from Redux
  const formulas = useAppSelector((state) => state.assetState.formulas);
  const formulasLoading = useAppSelector(
    (state) => state.assetState.formulasLoading
  );
  const formulaInput = useAppSelector((state) => state.assetState.formulaInput);
  const selectedSubgroupTag = useAppSelector(
    (state) => state.assetState.selectedSubgroupTag
  );

  // Get formula creation states from Redux
  const formulaName = useAppSelector((state) => state.assetState.formulaName);
  const formulaExpression = useAppSelector(
    (state) => state.assetState.formulaExpression
  );
  const formulaDesc = useAppSelector((state) => state.assetState.formulaDesc);
  const isCreating = useAppSelector(
    (state) => state.assetState.isCreatingFormula
  );

  // Additional states for formula selection and deletion
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFormulaForDelete, setSelectedFormulaForDelete] = React.useState<number | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [selectedFormulaToApply, setSelectedFormulaToApply] = React.useState<Formula | null>(null);

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

  // Handle dialog state and fetch formulas when opened
  const handleSelectDialogOpen = async (open: boolean) => {
    setSelectDialogOpen(open);
    if (open && formulas.length === 0) {
      await formulaClientService.loadFormulas(dispatch);
    }
  };

  // Handle dialog state for create dialog
  const handleCreateDialogOpen = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      // Reset form when closing dialog
      dispatch(assetAction.resetFormulaForm());
    }
  };

  // Handle formula selection from dialog
  const handleSelectFormula = async (formula: Formula) => {
    try {
      // First, if we have a selected tag, update the backend first
      if (selectedSubgroupTag && formula.formula_id) {
        console.log(
          `Updating subgroup tag ${selectedSubgroupTag.subgroup_tag_id} with formula ${formula.formula_id}`
        );

        // Update the backend first
        await updateSubgroupTagFormula(
          selectedSubgroupTag.subgroup_tag_id,
          formula.formula_id
        );

        // Update local state to match what's now in the backend
        const updatedTag = {
          ...selectedSubgroupTag,
          formula_id: formula.formula_id,
        };

        // Update Redux with the updated tag
        dispatch(assetAction.selectSubgroupTag(updatedTag));

        // Explicitly update the formula display in UI
        dispatch(assetAction.setFormulaInput(formula.formula_expression));
        dispatch(assetAction.setSelectedFormulaId(formula.formula_id));

        // Refresh the UI by refetching the formula to ensure consistency
        const refreshedFormula = await formulaService.getFormulaById(formula.formula_id);
        dispatch(assetAction.setFormulaInput(refreshedFormula.formula_expression));

        toast.success("Formula assigned to tag successfully");
      } else {
        // No tag selected, just update the local UI
        dispatch(assetAction.setFormulaInput(formula.formula_expression));
        dispatch(assetAction.setSelectedFormulaId(formula.formula_id || null));
      }
    } catch (error) {
      console.error("Error updating formula for tag:", error);
      toast.error("Failed to assign formula to tag");
    }

    // Close the dialog
    setSelectDialogOpen(false);
  };

  // Extract variables from formula expression (with $ prefix)
  const extractVariables = (expression: string): string[] => {
    // Find all variables with $ prefix
    const regex = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const matches = expression.match(regex);

    if (!matches) return [];

    // Remove $ prefix and return unique variable names
    const uniqueVars = Array.from(
      new Set(matches.map((match) => match.substring(1)))
    );

    return uniqueVars;
  };

  // Handle formula creation
  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(assetAction.setIsCreatingFormula(true));

    try {
      // Extract variables with $ prefix
      const extractedVars = extractVariables(formulaExpression);

      const formulaData = {
        formula_name: formulaName,
        formula_desc: formulaDesc || undefined,
        formula_expression: formulaExpression,
        // Remove num_parameters field - it's no longer in the database model
        variables: extractedVars.map((varName) => ({
          variable_name: varName,
        })),
      };

      console.log("Sending formula data:", formulaData);

      // Create formula in the database
      const result = await formulaClientService.submitFormula(
        formulaData,
        dispatch
      );

      if (result) {
        // Reset form via Redux
        dispatch(assetAction.resetFormulaForm());

        // Close dialog
        setCreateDialogOpen(false);

        // Reload formulas list to include the new formula
        await formulaClientService.loadFormulas(dispatch);

        // Show success message
        toast.success(`Formula "${formulaName}" created successfully!`);
      }
    } catch (error) {
      console.error("Error creating formula:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create formula"
      );
    } finally {
      dispatch(assetAction.setIsCreatingFormula(false));
    }
  };

  // Filter formulas based on search query
  const filteredFormulas = React.useMemo(() => {
    if (!searchQuery) return formulas;
    return formulas.filter((formula) =>
      formula.formula_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [formulas, searchQuery]);

  // Handle formula deletion
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
      setSelectedFormulaForDelete(null);
      
      toast.success("Formula deleted successfully");
      
      // If the deleted formula was the selected one, clear it
      if (selectedFormulaForDelete === useAppSelector((state) => state.assetState.selectedFormulaId)) {
        dispatch(assetAction.setFormulaInput(""));
        dispatch(assetAction.setSelectedFormulaId(null));
      }
    } catch (error) {
      console.error("Error deleting formula:", error);
      toast.error("Failed to delete formula");
    } finally {
      setIsDeleting(false);
    }
  };

  // New function to apply the selected formula
  const handleApplySelectedFormula = () => {
    if (selectedFormulaToApply) {
      handleSelectFormula(selectedFormulaToApply);
    } else {
      toast.error("Please select a formula to apply");
    }
  };

  return (
    <div className="inline-flex flex-row w-full gap-2 items-center mb-2">
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
              onClick={() => {
                dispatch(assetAction.setFormulaInput(""));
                dispatch(assetAction.setSelectedFormulaId(null));
              }}
              disabled={isDisabled}
            >
              <XMarkIcon className="w-4 h-4" />
            </Button>
          )}

          <Dialog open={selectDialogOpen} onOpenChange={handleSelectDialogOpen}>
            <DialogTrigger disabled={isDisabled} asChild>
              <Button variant="outline" size="sm">
                Select
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select a Formula</DialogTitle>
                <DialogDescription>
                  Choose a formula from the list below to use in your
                  calculation.
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
                        onClick={() => setSelectedFormulaToApply(formula)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formula.formula_name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formula.formula_expression}
                          </span>
                        </div>
                        {selectedFormulaToApply?.formula_id === formula.formula_id && (
                          <CheckIcon className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    {searchQuery ? 
                      "No formulas match your search." :
                      "No formulas found. Create one first."
                    }
                  </div>
                )}
              </div>

              {/* Formula action button at the bottom */}
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

          <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogOpen}>
            <DialogTrigger disabled={isDisabled} asChild>
              <Button variant="outline" size="sm">
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Formula</DialogTitle>
                <DialogDescription>
                  Enter a name and expression for your new formula. Use
                  $variable to define variables (e.g., $pressure + $temperature
                  * 2).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFormula}>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="formula-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="formula-name"
                      value={formulaName}
                      onChange={(e) =>
                        dispatch(assetAction.setFormulaName(e.target.value))
                      }
                      className="col-span-3"
                      placeholder="e.g., Simple Interest"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="formula-desc" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="formula-desc"
                      value={formulaDesc}
                      onChange={(e) =>
                        dispatch(assetAction.setFormulaDesc(e.target.value))
                      }
                      className="col-span-3"
                      placeholder="e.g., Calculates simple interest"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="formula-expression" className="text-right">
                      Expression
                    </Label>
                    <Input
                      id="formula-expression"
                      value={formulaExpression}
                      onChange={(e) =>
                        dispatch(
                          assetAction.setFormulaExpression(e.target.value)
                        )
                      }
                      className="col-span-3"
                      placeholder="e.g., $principal*$rate*$time/100"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Saving..." : "Save Formula"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
