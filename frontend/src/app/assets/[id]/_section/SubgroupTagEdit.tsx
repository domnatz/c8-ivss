"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SearchForm } from "@/components/user/search-form";
import {
  AdjustmentsVerticalIcon,
  ChevronUpDownIcon,
  DocumentCheckIcon,
  PlusCircleIcon,
  TagIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Subgroup_tag } from "@/models/subgroup-tag";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import TemplateSelector from "@/app/assets/[id]/_section/_components/template-selection";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import AddSubgroupTagButton from "./_components/add-subgroup-tag-button";
import { createFormula, getAllFormulas } from "@/_actions/formula-actions"; // Update import
import { Formula } from "@/models/formula"; // Import the Formula interface
import { getChildTagsByParentId } from "@/_services/subgroup-tag-service"; // Import the service function

interface SubgroupTagEditProps {
  selectedSubgroupTag: Subgroup_tag | null; // Update prop type
}

export default function SubgroupTagEdit({
  selectedSubgroupTag,
}: SubgroupTagEditProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">(
    "newest"
  );
  const [loading, setLoading] = React.useState(false);
  const [subgroupTags, setSubgroupTags] = React.useState<Subgroup_tag[]>([]);
  const [formulaInput, setFormulaInput] = React.useState(""); // Add state for formula input
  const [childTags, setChildTags] = React.useState<Subgroup_tag[]>([]); // Add state for child tags
  const [childTagsLoading, setChildTagsLoading] = React.useState(false); // Add loading state for child tags
  const [formulas, setFormulas] = React.useState<Formula[]>([]); // Add state for formulas
  const [formulasLoading, setFormulasLoading] = React.useState(false); // Add loading state for formulas
  const [dialogOpen, setDialogOpen] = React.useState(false); // Add state for dialog
  const params = useParams();
  const dispatch = useAppDispatch(); // Add this line to use dispatch

  // Add this function to handle tag deselection
  const handleDeselectTag = () => {
    dispatch({ type: "assetSlice/selectSubgroupTag", payload: null });
  };

  // Add this function to handle formula submission
  const handleFormulaSubmit = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      console.log("Submitting formula:", formulaInput); // Add this line
      const newFormula: Formula = {
        formula_name: "New Formula", // Replace with actual formula name
        formula_expression: formulaInput,
        num_parameters: 0, // Replace with actual number of parameters
      };
      const result = await createFormula(newFormula);
      console.log("Create formula result:", result); // Add this line
      if (result.success) {
        toast.success("Formula created successfully!");
        setFormulaInput(""); // Clear the input field
      } else {
        toast.error(`Error creating formula: ${result.error}`);
      }
    }
  };

  // Fetch child tags when a subgroup tag is selected
  React.useEffect(() => {
    if (selectedSubgroupTag) {
      setChildTagsLoading(true);
      getChildTagsByParentId(selectedSubgroupTag.subgroup_tag_id)
        .then((tags) => {
          setChildTags(tags);
        })
        .catch((error) => {
          console.error("Error fetching child tags:", error);
          toast.error("Failed to fetch child tags");
          setChildTags([]);
        })
        .finally(() => {
          setChildTagsLoading(false);
        });
    } else {
      setChildTags([]);
    }
  }, [selectedSubgroupTag]);

  // Add function to fetch formulas when dialog opens
  const handleDialogOpen = async (open: boolean) => {
    setDialogOpen(open);
    if (open && formulas.length === 0) {
      setFormulasLoading(true);
      try {
        const result = await getAllFormulas();
        if (result.success) {
          setFormulas(result.data);
        } else {
          toast.error(`Error fetching formulas: ${result.error}`);
        }
      } catch (error) {
        console.error("Error fetching formulas:", error);
        toast.error("Failed to fetch formulas");
      } finally {
        setFormulasLoading(false);
      }
    }
  };

  // Add function to handle formula selection
  const handleSelectFormula = (formula: Formula) => {
    setFormulaInput(formula.formula_expression);
    setDialogOpen(false);
  };

  // Filter child tags based on search query
  const filteredChildTags = childTags.filter((tag) =>
    tag.subgroup_tag_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort child tags based on sortOrder
  const sortedChildTags = [...filteredChildTags].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.subgroup_tag_id - a.subgroup_tag_id;
    } else {
      return a.subgroup_tag_id - b.subgroup_tag_id;
    }
  });

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex flex-col justify-between items-start gap-1">
        <div className="flex flex-wrap gap-2 sm:flex-row justify-between w-full">
          <h2 className="text-lg font-semibold flex flex-row items-center gap-2">
            Tag Editor
            {/* Display selected subgroup tag name */}
            {selectedSubgroupTag && (
              <span className="text-sm text-blue-600 bg-blue-100 flex flex-row items-center gap-2 p-1 pl-4 pr-2  rounded-full ">
                {/* <TagIcon className="w-4 h-4" /> */}
                {selectedSubgroupTag.subgroup_tag_name}
                <XCircleIcon
                  className="w-4 h-4 cursor-pointer hover:text-blue-800"
                  onClick={handleDeselectTag}
                />
              </span>
            )}
          </h2>
          <AddSubgroupTagButton />
        </div>
      </div>

      <div className="w-full flex flex-row items-center gap-2">
        <SearchForm
          className="w-full"
          value={searchQuery}
          onInputChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter tags..."
        />

        <DropdownMenu>
          <DropdownMenuTrigger className="px-2 py-1 h-full flex items-center gap-1 border border-zinc-200 rounded-md text-foreground text-sm">
            <AdjustmentsVerticalIcon className="w-4 h-4 text-foreground" />
            Sort
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder("newest")}>
              Newest Added
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
              Oldest Added
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-full ">
        <TemplateSelector />
      </div>

      {/* Display formula subgroup tags */}
      <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full overflow-y-auto">
        {selectedSubgroupTag ? (
          <>
            <div className="inline-flex flex-row w-full gap-2 items-center mb-2 ">
              <Input
                placeholder="Make a formula..."
                className="bg-background w-full"
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                onKeyDown={handleFormulaSubmit}
              />
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
                <DialogTrigger className="p-1.5 px-4 border border-b bg-background rounded-md cursor-pointer hover:bg-muted">
                  <span className="whitespace-nowrap text-sm font-medium">Select a Formula</span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select a Formula</DialogTitle>
                    <DialogDescription>
                      Choose a formula from the list below to use in your calculation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[50vh] overflow-y-auto">
                    {formulasLoading ? (
                      <div className="py-4 text-center text-muted-foreground">
                        Loading formulas...
                      </div>
                    ) : formulas.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {formulas.map((formula) => (
                          <div
                            key={formula.formula_id}
                            className="flex items-center justify-between p-2 bg-background rounded-md border border-zinc-200 hover:bg-muted transition-colors cursor-pointer"
                            onClick={() => handleSelectFormula(formula)}
                          >
                            <span className="font-medium">{formula.formula_name}</span>
                            <span className="text-sm text-muted-foreground">{formula.formula_expression}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-muted-foreground">
                        No formulas found. Create one first.
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Display child tags */}
            {childTagsLoading ? (
              <div className="py-4 text-center text-muted-foreground">
                Loading child tags...
              </div>
            ) : sortedChildTags.length > 0 ? (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-svh">
                {sortedChildTags.map((tag) => (
                  <div
                    key={tag.subgroup_tag_id}
                    className="flex items-center justify-between p-2 bg-background rounded-md border border-zinc-200 hover:bg-muted transition-colors"
                  >
                    <span className="flex flex-row justify-between w-full px-2 items-center gap-2 font-medium text-sm">
                      {tag.subgroup_tag_name}
                      <TagIcon className="w-4 h-4 text-blue-500" />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                No child tags found for this subgroup tag 
              </div>
            )}
          </>
        ) : (
          <span className="text-md justify-center flex flex-row text-center text-muted-foreground h-full items-center">
            Select a subgroup tag first
          </span>
        )}
      </div>

      <Button variant="outline" className="cursor-pointer">
        <DocumentCheckIcon />
        <span>Save Changes</span>
      </Button>
    </div>
  );
}
