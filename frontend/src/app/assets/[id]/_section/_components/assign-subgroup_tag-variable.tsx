import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircleIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "@/hooks/hooks";
import { useEffect, useState } from "react";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { fetchTagsBySubgroupId } from "@/_services/subgroup-service";
import { toast } from "react-toastify";
import { SearchForm } from "@/components/user/search-form";

interface AssignSubgroupTagVariableProps {
  className?: string;
  buttonText?: string;
  variableName?: string;
  variableId?: number;  // Add variableId as a required prop
  refreshChildTags?: () => Promise<void>;
}

export default function AssignSubgroupTagVariable({
  className,
  buttonText = "Assign Tag",
  variableName,
  variableId,
  refreshChildTags,
}: AssignSubgroupTagVariableProps) {
  // Move the useAppSelector hook to the component level
  const selectedAsset = useAppSelector((state) => state.assetState.selectedAsset);
  const selectedSubgroupTag = useAppSelector((state) => state.assetState.selectedSubgroupTag);
  
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<string>("");
  const [subgroupTags, setSubgroupTags] = useState<Subgroup_tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [currentMapping, setCurrentMapping] = useState<{
    subgroup_tag_id: number | null;
    subgroup_tag_name: string | null;
  }>({ subgroup_tag_id: null, subgroup_tag_name: null });

  const handleSubgroupChange = (value: string) => {
    setSelectedSubgroupId(value);
    setSelectedTagId(null); // Reset selected tag when changing subgroup
  };

  // Fetch tags when subgroup selection changes
  useEffect(() => {
    if (selectedSubgroupId) {
      setIsLoading(true);
      fetchTagsBySubgroupId(Number(selectedSubgroupId))
        .then((tags) => {
          setSubgroupTags(tags);
        })
        .catch((error) => {
          console.error("Error fetching tags:", error);
          setSubgroupTags([]);
          toast.error("Failed to fetch tags for the selected subgroup");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setSubgroupTags([]);
    }
  }, [selectedSubgroupId]);

  // Filter tags based on search query
  const filteredTags = subgroupTags.filter((tag) =>
    tag.subgroup_tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

     // Updated assignTagToVariable function
     const assignTagToVariable = async (tagId: number) => {
      if (!variableId) {
        console.error("Variable ID is missing or undefined:", variableId);
        toast.error("Variable ID is missing - cannot assign tag");
        return;
      }
      
      // Now use selectedSubgroupTag from above, not another hook call
      if (!selectedSubgroupTag || !selectedSubgroupTag.subgroup_tag_id) {
        toast.error("No active subgroup tag context for this mapping");
        return;
      }
      
      console.log(`Mapping variable ${variableId} to tag ${tagId} in context ${selectedSubgroupTag.subgroup_tag_id}`);
      
      setIsSaving(true);
      try {
        const response = await fetch(`http://localhost:8000/api/variable-mappings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            variable_id: variableId,
            subgroup_tag_id: tagId,
            context_tag_id: selectedSubgroupTag.subgroup_tag_id
          })
        });
        
        if (!response.ok) {
          let errorMessage = 'Failed to assign tag to variable';
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || JSON.stringify(errorData);
          } catch (e) {
            errorMessage = `Server returned ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        toast.success(`Variable "${variableName}" mapped to tag "${result.subgroup_tag_name}"`);
        setIsOpen(false);
        
        // Refresh mappings if needed
        if (refreshChildTags) {
          await refreshChildTags();
        }
      } catch (error) {
        console.error("Error assigning tag:", error);
        toast.error(error instanceof Error ? error.message : "Failed to assign tag to variable");
      } finally {
        setIsSaving(false);
      }
    };

  const handleSelectTag = (tag: Subgroup_tag) => {
    setSelectedTagId(tag.subgroup_tag_id);
  };

  const handleSaveAssignment = async () => {
    if (selectedTagId) {
      await assignTagToVariable(selectedTagId);
    } else {
      toast.error("Please select a tag first");
    }
  };

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (selectedSubgroupTag || !open) {
          setIsOpen(open);
          if (open) {
            setSelectedSubgroupId("");
            setSearchQuery("");
            setSelectedTagId(null);
          }
        }
      }}>
        <DialogTrigger 
          className={`border bg-background cursor-pointer px-4 py-2 w-full flex flex-row rounded-md items-center text-sm font-medium gap-2 ${className}`}
          onClick={(e) => {
            e.preventDefault();
            if (selectedSubgroupTag) {
              setIsOpen(true);
            }
          }}
          disabled={!selectedSubgroupTag || !variableId} 
        >
          {currentMapping.subgroup_tag_name ? (
            <span className="truncate">{currentMapping.subgroup_tag_name}</span>
          ) : (
            <>
              <PlusCircleIcon className="h-5 w-5" />
              {buttonText}
            </>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Tag to Variable</DialogTitle>
            <DialogDescription>
              {variableName 
                ? `Select a tag to assign to the variable "${variableName}"`
                : "Select a tag to assign to this variable"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentMapping.subgroup_tag_name && (
              <div className="rounded-md bg-blue-50 p-3">
                <div className="flex items-center">
                  <div className="text-sm text-blue-700">
                    <span className="font-medium">Current assignment: </span>
                    {currentMapping.subgroup_tag_name}
                  </div>
                </div>
              </div>
            )}

            {/* Subgroup selection dropdown */}
            {selectedSubgroupTag && (
              <Select
                value={selectedSubgroupId}
                onValueChange={handleSubgroupChange}
              >
                <SelectTrigger id="subgroup-select" className="w-full">
                  <SelectValue placeholder="Select a subgroup" />
                </SelectTrigger>
                <SelectContent>
                  {selectedAsset?.subgroups?.map((subgroup) => (
                    <SelectItem
                      key={subgroup.subgroup_id}
                      value={subgroup.subgroup_id.toString()}
                    >
                      {subgroup.subgroup_name}
                    </SelectItem>
                  )) || (
                    <SelectItem value="no-subgroups" disabled>
                      No subgroups available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}

            {/* Add search form when subgroup is selected */}
            {selectedSubgroupId && !isLoading && subgroupTags.length > 0 && (
              <div className="mt-4 mb-2">
                <SearchForm
                  className="w-full"
                  value={searchQuery}
                  onInputChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tags..."
                />
              </div>
            )}

            {/* Display subgroup tags */}
            {selectedSubgroupId && (
              <div className="rounded-md bg-foreground/5 border border-zinc-200 p-5 w-full max-h-60 overflow-y-auto">
                {isLoading ? (
                  <p className="text-muted-foreground text-center">
                    Loading tags...
                  </p>
                ) : filteredTags.length > 0 ? (
                  <div className="flex flex-col gap-2 max-w-full min-w-full">
                    {filteredTags.map((tag) => (
                      <div
                        key={tag.subgroup_tag_id}
                        className={`flex items-center p-2 px-4 border rounded-md justify-between font-medium text-sm cursor-pointer hover:bg-muted gap-2 w-full ${
                          selectedTagId === tag.subgroup_tag_id ? "bg-primary/10 border-primary" : "bg-background"
                        }`}
                        onClick={() => handleSelectTag(tag)}
                      >
                        <div className="flex-1 overflow-hidden w-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block truncate text-left">{tag.subgroup_tag_name}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[300px]">
                                <p className="break-all">{tag.subgroup_tag_name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {selectedTagId === tag.subgroup_tag_id && (
                          <CheckIcon className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    {subgroupTags.length > 0
                      ? "No matching tags found."
                      : "No tags found for this subgroup."}
                  </p>
                )}
              </div>
            )}

            {/* Save button */}
            <div className="flex justify-end w-full">
              <Button 
                className="w-full"
                type="button"
                disabled={!selectedTagId || isSaving}
                onClick={handleSaveAssignment}
              >
                {isSaving ? "Saving..." : "Assign Tag"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}