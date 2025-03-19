"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createAsset } from "@/_actions/asset-actions";
import { useActionState } from "react";
import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ActionResponse {
  success: boolean;
  error?: string;
}

interface AddAssetButtonProps {
  className?: string;
  disabled?: boolean;
  onAssetAdded?: () => void;
}

export function AddAssetButton({ className, disabled, onAssetAdded }: AddAssetButtonProps) {
  const [state, formAction] = useActionState<ActionResponse | null, null>(
    createAsset,
    null
  );

  useEffect(() => {
    if (state) {
      console.log("Asset creation state:", state);
      if (state.success) {
        toast.success("Asset created successfully!");
        toast.info("Please refresh the page to see the new asset.");
        if (onAssetAdded) {
          onAssetAdded();
        }
      } else if (state.error) {
        toast.error(`Failed to create asset: ${state.error}`);
        console.error("Asset creation error:", state.error);
      }
    }
  }, [state, onAssetAdded]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
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
              console.log("Adding new asset...");
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
    </>
  );
}