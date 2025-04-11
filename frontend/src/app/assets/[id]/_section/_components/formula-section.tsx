"use client";

import * as React from "react";
import { FormulaDisplay } from "./formula-components/formula-input-display";
import { SelectFormulaDialog } from "./formula-components/select-formula-dialog";
import { CreateFormulaDialog } from "./formula-components/create-formula-dialog";

interface FormulaSectionProps {
  isDisabled?: boolean;
}

export default function FormulaSection({
  isDisabled = false,
}: FormulaSectionProps) {
  return (
    <div className="inline-flex flex-row w-full gap-2 items-center mb-2">
      <FormulaDisplay isDisabled={isDisabled} />
      <SelectFormulaDialog isDisabled={isDisabled} />
      <div className="h-6 w-px bg-gray-300 mx-1" aria-hidden="true" />
      <CreateFormulaDialog isDisabled={isDisabled} />
    </div>
  );
}
