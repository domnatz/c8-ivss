import * as React from "react";
import * as zod from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { assetAction } from "../../../_redux/asset-slice";
import { toast } from "react-toastify";
import { addFormula, fetchAllFormulas } from "@/_actions/formula-actions";
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
import { BeakerIcon } from "@heroicons/react/24/outline";

// Form validation schema
const formulaSchema = zod.object({
  name: zod
    .string()
    .min(1, "Name is required")
    .refine(
      (val) => val.trim().split(/\s+/).length <= 1,
      "Name should be no longer than 1 words"
    ),
  description: zod
    .string()
    .max(50, "Description should be no longer than 50 characters")
    .optional(),
  expression: zod
    .string()
    .min(1, "Formula expression is required")
    .refine(
      (val) => val.includes("="),
      "Formula must include an '=' sign (e.g., $result = $x + $y)"
    )
    .refine(
      (val) => /[+\-*\/]/.test(val),
      "Formula must contain at least one operator (+, -, *, /)"
    ),
});

interface CreateFormulaDialogProps {
  isDisabled?: boolean;
}

export const CreateFormulaDialog: React.FC<CreateFormulaDialogProps> = ({
  isDisabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  // Form validation errors state
  const [formErrors, setFormErrors] = React.useState<{
    name?: string;
    description?: string;
    expression?: string;
  }>({});

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
      setFormErrors({});
    }
  };

  // Validate form using Zod schema
  const validateForm = () => {
    try {
      formulaSchema.parse({
        name: formulaName,
        description: formulaDesc,
        expression: formulaExpression,
      });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof zod.ZodError) {
        const errors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          const path = err.path[0].toString();
          errors[path] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  // Handle formula creation
  const handleCreateFormula = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

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

      // Create formula using server action
      const result = await addFormula(formulaData);

      if (result.success) {
        // Reset form via Redux
        dispatch(assetAction.resetFormulaForm());

        // Reload formulas list to include the new formula
        const formulasResult = await fetchAllFormulas();
        if (formulasResult.success && formulasResult.data) {
          dispatch(assetAction.setFormulas(formulasResult.data));
        }

        // Show success message
        toast.success(`Formula "${formulaName}" created successfully!`);

        // Close the dialog
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to create formula");
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
        <Button variant="default">
          <BeakerIcon className="h-4 w-4" />
          Create Formula
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Formula</DialogTitle>
          <DialogDescription>
            Enter a name and expression for your new formula. Use $variable to
            define variables (e.g., $result = $pressure + $temperature * 2).
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
                className={`col-span-3 ${
                  formErrors.name ? "border-red-500" : ""
                }`}
                placeholder="e.g., Simple Interest"
                required
              />
              {formErrors.name && (
                <span className="text-xs text-red-500">{formErrors.name}</span>
              )}
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
                className={`col-span-3 ${
                  formErrors.description ? "border-red-500" : ""
                }`}
                placeholder="e.g., Calculates simple interest"
              />
              {formErrors.description && (
                <span className="text-xs text-red-500">
                  {formErrors.description}
                </span>
              )}
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
                className={`col-span-3 ${
                  formErrors.expression ? "border-red-500" : ""
                }`}
                placeholder="e.g., $result = $principal*$rate*$time/100"
                required
              />
              {formErrors.expression && (
                <span className="text-xs text-red-500">
                  {formErrors.expression}
                </span>
              )}
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
