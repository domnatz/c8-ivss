"use client";

import { useTransition } from "react";
import {
  PlusIcon,
  ArrowTurnDownRightIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { createSubgroup, updateSubgroupName } from "@/_actions/asset-actions";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { rootActions } from "@/app/_redux/root-slice";
import { Subgroup } from "@/models/subgroup";

interface SubgroupListProps {
  assetId: number;
  subgroups: Subgroup[];
  onSubgroupChange: () => void;
}

export function SubgroupList({
  assetId,
  subgroups,
  onSubgroupChange,
}: SubgroupListProps) {
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.rootState);
  const { editingSubgroupId, editingValues } = state;

  const handleAddSubgroup = () => {
    startTransition(async () => {
      try {
        const result = await createSubgroup(assetId);
        if (result.success) {
          toast.success("Subgroup created successfully");
          onSubgroupChange();
        } else {
          toast.error(`Failed to create subgroup: ${result.error}`);
        }
      } catch (error) {
        toast.error("An error occurred while creating the subgroup");
      }
    });
  };

  const handleSubgroupInputChange = (subgroupId: number, value: string) => {
    const key = `subgroup-${assetId}-${subgroupId}`;
    dispatch(
      rootActions.editingValueChanged({
        key,
        value,
      })
    );

    if (editingSubgroupId !== `${assetId}-${subgroupId}`) {
      dispatch(rootActions.editingSubgroupIdSet(`${assetId}-${subgroupId}`));
    }
  };

  const handleSubmitSubgroupRename = (
    subgroupId: number,
    e?: React.MouseEvent
  ) => {
    // Prevent event bubbling if called from a click event
    if (e) {
      e.stopPropagation();
    }

    const key = `subgroup-${assetId}-${subgroupId}`;
    const newName = editingValues[key];

    if (newName) {
      startTransition(async () => {
        try {
          const result = await updateSubgroupName({
            assetId,
            subgroupId,
            newName,
          });
          if (result.success) {
            toast.success("Subgroup renamed successfully");
            onSubgroupChange();
          } else {
            toast.error(`Failed to rename subgroup: ${result.error}`);
          }
        } catch (error) {
          toast.error("An error occurred while renaming the subgroup");
        } finally {
          dispatch(rootActions.editingCleared());
        }
      });
    }
  };

  return (
    <SidebarMenu>
      <Button
        variant="ghost"
        size="sm"
        className="justify-between text-xs rounded-none border-b-1 mx-2"
        onClick={handleAddSubgroup}
        disabled={isPending}
      >
        <span>Subgroups</span>
        <PlusIcon className="w-5 h-5" />
      </Button>

      {Array.isArray(subgroups) &&
        subgroups.map((subgroup) => {
          const subgroupKey = `${assetId}-${subgroup.subgroup_id}`;
          const isEditing = editingSubgroupId === subgroupKey;
          const inputValue =
            isEditing && editingValues[`subgroup-${subgroupKey}`] !== undefined
              ? editingValues[`subgroup-${subgroupKey}`]
              : subgroup.subgroup_name;

          return (
            <SidebarMenuItem key={subgroup.subgroup_id} className="pl-6">
              <SidebarMenuButton asChild>
                <div className="flex items-center justify-start w-full">
                  <ArrowTurnDownRightIcon className="w-5 h-5" />
                  <div className="flex items-center w-fit">
                    <Input
                      value={inputValue}
                      onChange={(e) => {
                        handleSubgroupInputChange(
                          subgroup.subgroup_id,
                          e.target.value
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmitSubgroupRename(subgroup.subgroup_id);
                        } else if (e.key === "Escape") {
                          dispatch(rootActions.editingCleared());
                        }
                      }}
                      onFocus={() => {
                        if (!editingValues[`subgroup-${subgroupKey}`]) {
                          dispatch(
                            rootActions.editingValueChanged({
                              key: `subgroup-${subgroupKey}`,
                              value: subgroup.subgroup_name,
                            })
                          );
                        }
                        dispatch(rootActions.editingSubgroupIdSet(subgroupKey));
                      }}
                      className="border-none bg-transparent p-0 w-fit h-fit shadow-none focus:ring-0 font-medium"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {isEditing && (
                      <div
                        role="button"
                        className="ml-1 p-1 h-auto inline-flex items-center justify-center text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground rounded-sm"
                        onClick={(e) =>
                          handleSubmitSubgroupRename(subgroup.subgroup_id, e)
                        }
                      >
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
    </SidebarMenu>
  );
}
