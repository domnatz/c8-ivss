import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { assetAction } from "../../../_redux/asset-slice";
import { toast } from "react-toastify";
import { formulaClientService } from "@/_actions/formula-actions";
import { extractVariables } from "../../../../../../utils/formula_utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateFormulaDialogProps {
  isDisabled?: boolean;
}

export const CreateFormulaDialog: React.FC<CreateFormulaDialogProps> = ({
  isDisabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  
  // Get formula creation states from Redux
  const formulaName = useAppSelector((state) => state.assetState.formulaName);
  const formulaExpression = useAppSelector(
    (state) => state.assetState.formulaExpression
  );
  const formulaDesc = useAppSelector((state) => state.assetState.formulaDesc);
  const isCreating = useAppSelector(
    (state) => state.assetState.isCreatingFormula
  );

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      // Reset form when closing dialog
      dispatch(assetAction.resetFormulaForm());
    }
  };
  
  // Handle formula creation
  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(assetAction.setIsCreatingFormula(true));

    try {
      // Extract variables from the formula expression
      const extractedVars = extractVariables(formulaExpression);

      const formulaData = {
        formula_name: formulaName,
        formula_desc: formulaDesc || undefined,
        formula_expression: formulaExpression,
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

        // Reload formulas list to include the new formula
        await formulaClientService.loadFormulas(dispatch);

        // Show success message
        toast.success(`Formula "${formulaName}" created successfully!`);
        
        // Close the dialog
        setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger disabled={isDisabled} asChild>
        <Button variant="outline" size="sm">
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Formula</DialogTitle>
          <DialogDescription>
            Enter a name and expression for your new formula. Use $variable to
            define variables (e.g., $pressure + $temperature * 2).
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
                  dispatch(assetAction.setFormulaExpression(e.target.value))
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
  );
};
