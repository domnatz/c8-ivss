"use client";

import { useTransition, useState } from "react";
import {
  PlusIcon,
  ArrowTurnDownRightIcon,
  CheckIcon,
  CubeTransparentIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createSubgroup, updateSubgroupName } from "@/_actions/asset-actions";
import { deleteSubgroupAction } from "@/_actions/subgroup-actions";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { rootActions } from "@/app/_redux/root-slice";
import { Subgroup } from "@/models/subgroup";

export function SubgroupList({
  assetId,
  subgroups,
  onSubgroupChange,
  className = "",
}: {
  assetId: number;
  subgroups: Subgroup[];
  onSubgroupChange: () => void;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.rootState);

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

    if (state.editingSubgroupId !== `${assetId}-${subgroupId}`) {
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
    const newName = state.editingValues[key];

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

  const startRenameSubgroup = (subgroupId: number, currentName: string) => {
    const subgroupKey = `${assetId}-${subgroupId}`;
    dispatch(
      rootActions.editingValueChanged({
        key: `subgroup-${subgroupKey}`,
        value: currentName,
      })
    );
    dispatch(rootActions.editingSubgroupIdSet(subgroupKey));
  };

  const handleDeleteSubgroup = (subgroupId: number) => {
    startTransition(async () => {
      try {
        const result = await deleteSubgroupAction(subgroupId);
        if (result.success) {
          toast.success("Subgroup deleted successfully");
          onSubgroupChange();
        } else {
          toast.error(`Failed to delete subgroup: ${result.error}`);
        }
      } catch (error) {
        toast.error("An error occurred while deleting the subgroup");
      }
    });
  };

  return (
    <SidebarMenu className={className}>
      <div
        className={`flex flex-row px-4 pr-1.5 items-center font-semibold border-b-1 justify-between w-full ${className}`}
      >
        <span className="text-sm">Subgroups</span>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-md bg-background/0 hover:text-blue-300 hover:bg-background/0 cursor-pointer"
          onClick={handleAddSubgroup}
          disabled={isPending}
        >
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      {Array.isArray(subgroups) &&
        subgroups.map((subgroup) => {
          const subgroupKey = `${assetId}-${subgroup.subgroup_id}`;
          const isEditing = state.editingSubgroupId === subgroupKey;
          const inputValue =
            isEditing &&
            state.editingValues[`subgroup-${subgroupKey}`] !== undefined
              ? state.editingValues[`subgroup-${subgroupKey}`]
              : subgroup.subgroup_name;

          return (
            <SidebarMenuItem key={subgroup.subgroup_id} className={className}>
              <SidebarMenuButton asChild className="hover:bg-background/0 hover:text-blue-600">
                <div className="flex items-center justify-between w-full pl-8 pr-2">
                  <div className="flex items-center">
                    <CubeTransparentIcon className="w-4 h-4 mr-1" />
                    <div className="flex items-center">
                      <Input
                        value={inputValue}
                        readOnly={!isEditing}
                        onChange={(e) => {
                          if (isEditing) {
                            handleSubgroupInputChange(
                              subgroup.subgroup_id,
                              e.target.value
                            );
                          }
                        }}
                        onKeyDown={(e) => {
                          if (isEditing) {
                            if (e.key === "Enter") {
                              handleSubmitSubgroupRename(subgroup.subgroup_id);
                            } else if (e.key === "Escape") {
                              dispatch(rootActions.editingCleared());
                            }
                          }
                        }}
                        onFocus={(e) => {
                          if (!isEditing) {
                            e.target.blur();
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isEditing) {
                            e.preventDefault();
                          }
                        }}
                        className={`border-none bg-transparent p-0 w-fit h-fit shadow-none rounded-xs font-medium 
                          ${isEditing 
                            ? 'border-b border-gray-300 cursor-text' 
                            : 'cursor-default pointer-events-none'} 
                          ${className}`}
                      />
                      
                      {isEditing && (
                        <div
                          role="button"
                          className="ml-1 p-1 h-auto inline-flex items-center justify-center text-sm font-medium hover:bg-accent/50 hover:text-accent-foreground rounded-sm"
                          onClick={(e) =>
                            handleSubmitSubgroupRename(subgroup.subgroup_id, e)
                          }
                        >
                          <CheckIcon className="w-4 h-4 text-green-600 cursor-pointer" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="p-0">
                        <EllipsisHorizontalIcon className="w-4 h-4 text-blue-400 cursor-pointer" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          startRenameSubgroup(subgroup.subgroup_id, subgroup.subgroup_name);
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubgroup(subgroup.subgroup_id);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
    </SidebarMenu>
  );
}
