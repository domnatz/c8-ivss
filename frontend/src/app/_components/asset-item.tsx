"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CubeIcon, CheckIcon } from "@heroicons/react/24/outline";
import { ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { updateAssetName } from "@/_actions/asset-actions";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { rootActions } from "@/app/_redux/root-slice";
import { Asset } from "@/models/asset";
import { SubgroupList } from "./subgroup-list";

interface AssetItemProps {
  asset: Asset;
  onAssetChange: () => void;
  isOpen: boolean;
  onToggle: (assetId: number) => void;
}

export function AssetItem({
  asset,
  onAssetChange,
  isOpen,
  onToggle,
}: AssetItemProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isPending, startTransition] = useTransition();
  const state = useAppSelector((state) => state.rootState);
  const { editingAssetId, editingValues } = state;

  const handleAssetInputChange = (value: string) => {
    dispatch(
      rootActions.editingValueChanged({
        key: `asset-${asset.asset_id}`,
        value,
      })
    );

    if (editingAssetId !== asset.asset_id) {
      dispatch(rootActions.editingAssetIdSet(asset.asset_id));
    }
  };

  const handleSubmitAssetRename = (e?: React.MouseEvent) => {
    // Prevent event bubbling if called from a click event
    if (e) {
      e.stopPropagation();
    }

    const key = `asset-${asset.asset_id}`;
    const newName = editingValues[key];

    if (newName) {
      startTransition(async () => {
        try {
          const result = await updateAssetName({
            assetId: asset.asset_id,
            newName,
          });

          if (result.success) {
            toast.success("Asset renamed successfully");
            onAssetChange();
          } else {
            toast.error(`Failed to rename asset: ${result.error}`);
          }
        } catch (error) {
          toast.error("An error occurred while renaming the asset");
        } finally {
          dispatch(rootActions.editingCleared());
        }
      });
    }
  };

  // Get the current value - either from editing state or asset name
  const inputValue =
    editingAssetId === asset.asset_id &&
    editingValues[`asset-${asset.asset_id}`] !== undefined
      ? editingValues[`asset-${asset.asset_id}`]
      : asset.asset_name;

  // Define active asset styles
  const activeAssetClass = isOpen
    ? "bg-orange-50 text-[#FF5B1A] font-medium"
    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={() => onToggle(asset.asset_id)}
      className="group/collapsible border-b-[0.5px] border-zinc-300"
    >
      <SidebarGroup className="px-0 py-0">
        <SidebarGroupLabel
          asChild
          className={`group/label text-sm text-sidebar-foreground`}
        >
          <div>
            <CollapsibleTrigger
              className={`flex w-full items-center justify-between px-2 py-1 rounded-md ${activeAssetClass}`}
              onClick={() => {
                // Only navigate if not in edit mode
                if (editingAssetId !== asset.asset_id) {
                  router.push(`/assets/${asset.asset_id}`);
                }
              }}
            >
              <div className="flex items-center justify-center">
                <CubeIcon
                  className={`w-5 h-5 pr-1 ${isOpen ? "text-[#FF5B1A]" : ""}`}
                />
                <div className="flex items-center w-fit">
                  <Input
                    value={inputValue}
                    onChange={(e) => handleAssetInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmitAssetRename();
                      } else if (e.key === "Escape") {
                        dispatch(rootActions.editingCleared());
                      }
                    }}
                    onFocus={() => {
                      if (!editingValues[`asset-${asset.asset_id}`]) {
                        dispatch(
                          rootActions.editingValueChanged({
                            key: `asset-${asset.asset_id}`,
                            value: asset.asset_name,
                          })
                        );
                      }
                      dispatch(rootActions.editingAssetIdSet(asset.asset_id));
                    }}
                    className={`border-none bg-transparent p-0 w-fit h-fit shadow-none focus:ring-0 ${
                      isOpen ? "text-[#FF5B1A] font-medium" : ""
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {editingAssetId === asset.asset_id && (
                    <div
                      role="button"
                      className="ml-1 p-1 h-auto inline-flex items-center justify-center text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground rounded-sm"
                      onClick={handleSubmitAssetRename}
                    >
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight
                className={`ml-auto w-5 h-5 transition-transform group-data-[state=open]/collapsible:rotate-90 ${
                  isOpen ? "text-[#FF5B1A]" : ""
                }`}
              />
            </CollapsibleTrigger>
          </div>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SubgroupList
              assetId={asset.asset_id}
              subgroups={asset.subgroups || []}
              onSubgroupChange={onAssetChange}
            />
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
