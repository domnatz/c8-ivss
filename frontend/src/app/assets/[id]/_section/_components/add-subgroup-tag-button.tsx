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

/**
 * Props interface for AddSubgroupTagButton component
 * @param className - Optional CSS class for styling
 * @param buttonText - Optional custom text for the button (defaults to "Add Subgroup Tag")
 */
interface AddSubgroupTagButtonProps {
  className?: string;
  buttonText?: "Add Subgroup Tag";
}

/**
 * Component that renders a button which opens a dialog to add subgroup tags
 * The dialog allows selecting a subgroup, searching for tags, and selecting a tag to add
 */
export default function AddSubgroupTagButton({
  className,
  buttonText = "Add Subgroup Tag",
}: AddSubgroupTagButtonProps) {
  // Get the currently selected asset from Redux store
  const selectedAsset = useAppSelector(
    (state) => state.assetState.selectedAsset
  );
  
  // State management for subgroup selection, tags, loading state and search
  const [selectedSubgroupId, setSelectedSubgroupId] =
    React.useState<string>("");  // Stores the ID of the selected subgroup
  const [subgroupTags, setSubgroupTags] = React.useState<Subgroup_tag[]>([]); // Stores the tags for the selected subgroup
  const [isLoading, setIsLoading] = React.useState<boolean>(false); // Tracks loading state when fetching tags
  const [searchQuery, setSearchQuery] = React.useState(""); // Stores the current search query for filtering tags

  /**
   * Handler for subgroup selection change
   * Updates the selectedSubgroupId state when user selects a different subgroup
   */
  const handleSubgroupChange = (value: string) => {
    setSelectedSubgroupId(value);
  };

  /**
   * Effect hook to fetch tags when selected subgroup changes
   * Gets triggered whenever selectedSubgroupId changes
   */
  useEffect(() => {
    if (selectedSubgroupId) {
      setIsLoading(true);
      // Call API to fetch tags for the selected subgroup
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
      // Clear tags when no subgroup is selected
      setSubgroupTags([]);
    }
  }, [selectedSubgroupId]); // Dependency array - effect runs when selectedSubgroupId changes

  /**
   * Filter tags based on search query
   * Creates a filtered list of tags that match the current search query
   */
  const filteredTags = subgroupTags.filter((tag) =>
    tag.subgroup_tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Dialog component for the tag selection UI */}
      <Dialog>
        {/* Button that triggers the dialog to open */}
        <DialogTrigger className="border bg-foreground text-background px-4 py-1 w-full flex flex-row rounded-md items-center text-sm font-medium gap-2">
          <PlusCircleIcon className="h-5 w-5" />
          {buttonText}
        </DialogTrigger>
        {/* Dialog content container */}
        <DialogContent>
          {/* Dialog header section with title and description */}
          <DialogHeader>
            <DialogTitle>Subgroup Tags</DialogTitle>
            <DialogDescription>
              Select a Subgroup first then add a tag
            </DialogDescription>
          </DialogHeader>

          <div>
            {/* Subgroup selection dropdown */}
            <Select
              value={selectedSubgroupId}
              onValueChange={handleSubgroupChange}
            >
              <SelectTrigger id="subgroup-select" className="w-full">
                <SelectValue placeholder="Select a subgroup" />
              </SelectTrigger>
              <SelectContent>
                {/* Map through available subgroups from the selected asset */}
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

            {/* Search form - only displayed when subgroup is selected and tags are available */}
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

            {/* Tags display section - only shown when a subgroup is selected */}
            {selectedSubgroupId && (
              <div className="rounded-md bg-foreground/5 border border-zinc-200 p-5 w-full mt-4 max-h-60 overflow-y-auto">
                {/* Show loading state while fetching tags */}
                {isLoading ? (
                  <p className="text-muted-foreground text-center">
                    Loading tags...
                  </p>
                ) : filteredTags.length > 0 ? (
                  /* Display available tags when present */
                  <div className="flex flex-col gap-2">
                    {filteredTags.map((tag) => (
                      <Button
                        key={tag.subgroup_tag_id}
                        variant="outline"
                        className="flex items-center justify-between gap-2"
                      >
                        {tag.subgroup_tag_name}
                        <PlusCircleIcon className="h-4 w-4 ml-1" />
                      </Button>
                    ))}
                  </div>
                ) : (
                  /* Message when no tags match the filter or no tags exist */
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
