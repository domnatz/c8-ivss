"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Formula } from "@/models/formula";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import { formulaClientService } from "@/_services/formula-service";
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
  const formulasLoading = useAppSelector((state) => state.assetState.formulasLoading);
  const formulaInput = useAppSelector((state) => state.assetState.formulaInput);
  const selectedSubgroupTag = useAppSelector((state) => state.assetState.selectedSubgroupTag);
  
  // Get formula creation states from Redux
  const formulaName = useAppSelector((state) => state.assetState.formulaName);
  const formulaExpression = useAppSelector((state) => state.assetState.formulaExpression);
  const formulaDesc = useAppSelector((state) => state.assetState.formulaDesc);
  const isCreating = useAppSelector((state) => state.assetState.isCreatingFormula);

  // Reset formula input when selected subgroup tag changes
  React.useEffect(() => {
    dispatch(assetAction.setFormulaInput(""));
    
    if (selectedSubgroupTag?.formula_id) {
      // Load formulas if needed
      if (formulas.length === 0) {
        formulaClientService.loadFormulas(dispatch);
      } 
      // If formulas are already loaded, find and set the formula
      else {
        const formula = formulas.find(f => f.formula_id === selectedSubgroupTag.formula_id);
        if (formula) {
          dispatch(assetAction.setFormulaInput(formula.formula_expression));
          dispatch(assetAction.setSelectedFormulaId(formula.formula_id ?? null));
        }
      }
    } else {
      dispatch(assetAction.setSelectedFormulaId(null));
    }
  }, [selectedSubgroupTag, dispatch, formulas]);

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
    // Update the formula input display
    formulaClientService.selectFormula(formula, dispatch);
    
    // Also store the selected formula ID in Redux
    dispatch(assetAction.setSelectedFormulaId(formula.formula_id ?? null));
    
    // DIRECT UPDATE: Update the formula in the backend immediately when selected
    if (selectedSubgroupTag && formula.formula_id) {
      try {
        console.log('Updating formula directly:', {
          subgroupTagId: selectedSubgroupTag.subgroup_tag_id,
          formulaId: formula.formula_id
        });
        
        await updateSubgroupTagFormula(
          selectedSubgroupTag.subgroup_tag_id, 
          formula.formula_id
        );
        
        toast.success("Formula assigned to tag successfully");
        
        // Update the selectedSubgroupTag in Redux to reflect the formula change
        dispatch(assetAction.selectSubgroupTag({
          ...selectedSubgroupTag,
          formula_id: formula.formula_id
        }));
      } catch (error) {
        console.error("Error updating formula for tag:", error);
        toast.error("Failed to assign formula to tag");
      }
    }
    
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
      new Set(matches.map(match => match.substring(1)))
    );
    
    return uniqueVars;
  };

  // Calculate number of parameters in formula expression
  const calculateParameterCount = (expression: string): number => {
    // Use the extracted variables function to find variables with $ prefix
    const variables = extractVariables(expression);
    return variables.length;
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
          variables: extractedVars.map(varName => ({
            variable_name: varName
          }))
        };
        
        console.log("Sending formula data:", formulaData);
        
        // Create formula in the database
        const result = await formulaClientService.submitFormula(formulaData, dispatch);
        
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
        toast.error(error instanceof Error ? error.message : "Failed to create formula");
      } finally {
        dispatch(assetAction.setIsCreatingFormula(false));
      }
    };

  return (
    <div className="inline-flex flex-row w-full gap-2 items-center mb-2">
      <div className="flex w-full justify-between items-center p-2 bg-background rounded-md border border-input">
        <div className="truncate text-sm">
          {formulaInput ? (
            <span className="font-medium pl-2">{formulaInput}</span>
          ) : (
            <span className="text-muted-foreground pl-2">Select or create a formula...</span>
          )}
        </div>
        <div className="flex gap-2">
          {formulaInput && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                dispatch(assetAction.setFormulaInput(""));
                dispatch(assetAction.setSelectedFormulaId(null));
              }}
              disabled={isDisabled}
            >
              Clear
            </Button>
          )}
          
          <Dialog open={selectDialogOpen} onOpenChange={handleSelectDialogOpen}>
            <DialogTrigger
              disabled={isDisabled}
              asChild
            >
              <Button variant="outline" size="sm">Select</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select a Formula</DialogTitle>
                <DialogDescription>
                  Choose a formula from the list below to use in your calculation.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50vh] overflow-y-auto">
                {formulasLoading ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Loading formulas...
                  </div>
                ) : formulas.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {formulas.map((formula) => (
                      <div
                        key={formula.formula_id}
                        className="flex items-center justify-between p-2 bg-background rounded-md border border-zinc-200 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => handleSelectFormula(formula)}
                      >
                        <span className="font-medium">{formula.formula_name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formula.formula_expression}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No formulas found. Create one first.
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogOpen}>
            <DialogTrigger
              disabled={isDisabled}
              asChild
            >
              <Button variant="outline" size="sm">Create</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Formula</DialogTitle>
                <DialogDescription>
                  Enter a name and expression for your new formula. Use $variable to define variables (e.g., $pressure + $temperature * 2).
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateFormula}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formula-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="formula-name"
                      value={formulaName}
                      onChange={(e) => dispatch(assetAction.setFormulaName(e.target.value))}
                      className="col-span-3"
                      placeholder="e.g., Simple Interest"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formula-desc" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="formula-desc"
                      value={formulaDesc}
                      onChange={(e) => dispatch(assetAction.setFormulaDesc(e.target.value))}
                      className="col-span-3"
                      placeholder="e.g., Calculates simple interest"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formula-expression" className="text-right">
                      Expression
                    </Label>
                    <Input
                      id="formula-expression"
                      value={formulaExpression}
                      onChange={(e) => dispatch(assetAction.setFormulaExpression(e.target.value))}
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