"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAsset } from "@/_actions/asset-actions";
import { useActionState } from "react";
import React from "react";

interface ActionResponse {
  success: boolean;
  error?: string;
}

interface AddAssetButtonProps {
  className?: string;
  disabled?: boolean;
}

export function AddAssetButton({ className, disabled }: AddAssetButtonProps) {
  const [_, formAction] = useActionState<ActionResponse | null, null>(
    createAsset,
    null
  );

  return (
    <div
      className={`flex justify-between w-full items-center pl-4 pr-2 border-y-[0.5px] border-zinc-300 ${
        className || ""
      }`}
    >
      <Label>Assets</Label>
      <form>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
          className="hover:text-foreground/50 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            React.startTransition(() => {
              formAction(null);
            });
          }}
          disabled={disabled}
        >
          <PlusIcon className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}