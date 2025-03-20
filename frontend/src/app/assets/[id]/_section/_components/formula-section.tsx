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

interface FormulaSectionProps {
  isDisabled?: boolean;
}

export default function FormulaSection({
  isDisabled = false,
}: FormulaSectionProps) {
  const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [formulaName, setFormulaName] = React.useState("");
  const [formulaExpression, setFormulaExpression] = React.useState("");
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

  // Reset formula input when selected subgroup tag changes
  React.useEffect(() => {
    dispatch(assetAction.setFormulaInput(""));
  }, [selectedSubgroupTag, dispatch]);

  // Handle dialog state and fetch formulas when opened
  const handleSelectDialogOpen = async (open: boolean) => {
    setSelectDialogOpen(open);
    if (open && formulas.length === 0) {
      await formulaClientService.loadFormulas(dispatch);
    }
  };

  // Handle formula selection from dialog
  const handleSelectFormula = (formula: Formula) => {
    formulaClientService.selectFormula(formula, dispatch);
    setSelectDialogOpen(false);
  };

  // Placeholder for future formula creation functionality
  const handleCreateFormula = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create formula:", { name: formulaName, expression: formulaExpression });
    setFormulaName("");
    setFormulaExpression("");
    setCreateDialogOpen(false);
    // Functionality for posting the formula will be implemented later
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
              onClick={() => dispatch(assetAction.setFormulaInput(""))}
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
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                  Enter a name and expression for your new formula.
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
                      onChange={(e) => setFormulaName(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., Simple Interest"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formula-expression" className="text-right">
                      Expression
                    </Label>
                    <Input
                      id="formula-expression"
                      value={formulaExpression}
                      onChange={(e) => setFormulaExpression(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., P*R*T/100"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Formula</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
