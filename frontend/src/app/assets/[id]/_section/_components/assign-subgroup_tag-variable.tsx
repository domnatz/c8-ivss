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
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "@/hooks/hooks";
import { useEffect } from "react";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { fetchTagsBySubgroupId } from "@/_services/subgroup-service";
import { toast } from "react-toastify";
import { SearchForm } from "@/components/user/search-form";
// Removed import for addTagToSubgroupTag

interface AssignSubgroupTagVariableProps {
  className?: string;
  buttonText?: string;
  variableName?: string;
  refreshChildTags?: () => Promise<void>;
}

export default function AssignSubgroupTagVariable({
  className,
  buttonText = "Add Subgroup Tag",
  variableName,
  refreshChildTags,
}: AssignSubgroupTagVariableProps) {
  const selectedAsset = useAppSelector(
    (state) => state.assetState.selectedAsset
  );
  const selectedSubgroupTag = useAppSelector(
    (state) => state.assetState.selectedSubgroupTag
  );
  const [selectedSubgroupId, setSelectedSubgroupId] =
    React.useState<string>("");
  const [subgroupTags, setSubgroupTags] = React.useState<Subgroup_tag[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSubgroupChange = (value: string) => {
    setSelectedSubgroupId(value);
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

  // Removed handleAddTagToSubgroupTag function

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={(open) => {
        // Safely handle dialog state changes
        if (selectedSubgroupTag || !open) {
          setIsOpen(open);
        }
      }}>
        <DialogTrigger 
          className={`border bg-background cursor-pointer px-4 py-2 w-full flex flex-row rounded-md items-center text-sm font-medium gap-2`}
          onClick={(e) => {
            e.preventDefault();
            if (selectedSubgroupTag) {
              setIsOpen(true);
            }
          }}
          disabled={!selectedSubgroupTag} 
        >
          <PlusCircleIcon className="h-5 w-5" />
          {buttonText}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Available Tags</DialogTitle>
            <DialogDescription>
              {variableName 
                ? `Browse available tags for the variable "${variableName}"`
                : "Browse available tags for this variable"}
            </DialogDescription>
          </DialogHeader>

          <div>
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
              <div className="rounded-md bg-foreground/5 border border-zinc-200 p-5 w-full mt-4 max-h-60 overflow-y-auto">
                {isLoading ? (
                  <p className="text-muted-foreground text-center">
                    Loading tags...
                  </p>
                ) : filteredTags.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {filteredTags.map((tag) => (
                      <div
                        key={tag.subgroup_tag_id}
                        className="flex items-center bg-background p-2 px-4 border rounded-md justify-between font-medium text-sm cursor-pointer hover:bg-muted gap-2"
                      >
                        {tag.subgroup_tag_name}
                        <PlusCircleIcon className="h-4 w-4 ml-1" />
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
