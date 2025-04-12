import * as React from "react";
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
import { saveTemplate, getTemplates, assignTemplate, deleteTemplate } from "@/_actions/template-actions";
import {
  ChevronUpDownIcon,
  BookmarkIcon,
  CheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/user/search-form";
import { Skeleton } from "@/components/ui/skeleton";
import { assetAction } from "../../_redux/asset-slice";
import { toast } from "react-toastify";


export default function TemplateSelector() {
  const dispatch = useAppDispatch();

  // Get states from Redux
  const subgroupTag = useAppSelector(
    (state) => state.assetState.selectedSubgroupTag
  );
  const selectedformulaId = useAppSelector(
    (state) => state.assetState.selectedFormulaId
  );
  const templates = useAppSelector((state) => state.assetState.templates);
  const isLoading = useAppSelector(
    (state) => state.assetState.templatesLoading
  );

  // Local UI states
  const [templateName, setTemplateName] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [selectDialogOpen, setSelectDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<number | null>(null);

  // Fetch templates when component mounts or after actions that modify templates
  React.useEffect(() => {
    const fetchTemplates = async () => {
      dispatch(assetAction.setTemplatesLoading(true));
      try {
        const templatesData = await getTemplates();
        dispatch(assetAction.setTemplates(templatesData));
        console.log("Templates loaded:", templatesData);
      } catch (error) {
        console.error("Failed to load templates:", error);
      } finally {
        dispatch(assetAction.setTemplatesLoading(false));
      }
    };

    fetchTemplates();
  }, [saveDialogOpen, isDeleting, dispatch]); // Refresh when save dialog closes or after deletion

  // Filter templates based on search query
  const filteredTemplates = React.useMemo(() => {
    if (!searchQuery) return templates;
    return templates.filter((template) =>
      template.template_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const handleSelectTemplate = async (templateId: number) => {
    // Check if a subgroup tag is selected
    if (!subgroupTag?.subgroup_tag_id) {
      toast.error("Please select a subgroup tag first");
      return;
    }
  
    try {
      // Show loading state
      toast.info("Applying template...");
      
      // Call the action to assign the template
      const result = await assignTemplate(templateId, subgroupTag.subgroup_tag_id);
      
      if (result.success) {
        toast.success(result.message);
        
        // Update the Redux state with the new formula
        if (result.formula_expression && result.formula_id) {
          dispatch(assetAction.setFormulaInput(result.formula_expression));
          dispatch(assetAction.setSelectedFormulaId(result.formula_id));
        }
        
        // Close dialog after success
        setTimeout(() => {
          setSelectDialogOpen(false);
          console.log("🔒 Select dialog closed");
        }, 500);

        setSearchQuery("");
        setSelectedTemplateId(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to apply template:", error);
      toast.error("An unexpected error occurred");
    }
  };
  
  // Handle template deletion
  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template to delete");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const result = await deleteTemplate(selectedTemplateId);
      
      if (result.success) {
        toast.success(result.message);
        setSelectedTemplateId(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle template save
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!selectedformulaId) {
      toast.error("No formula selected to save as template");
      return;
    }

    console.log(
      "Saving template:",
      templateName,
      "for formula:",
      selectedformulaId,
      "with context tag:",
      subgroupTag?.subgroup_tag_id
    );

    setIsSaving(true);

    try {
      const result = await saveTemplate({
        template_id: 0, // Assuming 0 for new template
        template_name: templateName,
        formula_id: Number(selectedformulaId),
      }, subgroupTag?.subgroup_tag_id); // Pass the selected subgroup tag ID as context

      console.log("Save result:", result);

      if (result.success) {
        toast.success(result.message || "Template saved successfully!");
        console.log("🎉 Template saved successfully!");
        setTemplateName("");

        // Close dialog after success
        setTimeout(() => {
          setSaveDialogOpen(false);
          console.log("🔒 Save dialog closed");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to save template");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
      console.log("⏹️ Template save process completed");
    }
  };

  // Determine if the component should be disabled
  const isDisabled = !subgroupTag;

  return (
    <div
      className={`flex flex-row justify-between w-full gap-2 ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      <Select 
        disabled={isDisabled}
        onValueChange={(value) => handleSelectTemplate(parseInt(value))}
      >
        <SelectTrigger className="w-full border">
          <SelectValue placeholder="Select Template" />
        </SelectTrigger>
        <SelectContent>
          {templates.slice(0, 10).map((template) => (
            <SelectItem
              key={template.template_id}
              value={String(template.template_id)}
            >
              {template.template_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Expand Template component */}
      <Dialog open={selectDialogOpen} onOpenChange={setSelectDialogOpen}>
        <DialogTrigger
          disabled={isDisabled}
          className="border rounded-md px-2 hover:text-blue-600 disabled:cursor-not-allowed"
        >
          <ChevronUpDownIcon className="h-5 w-5" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
            <DialogDescription>
              Select a template first, then apply or delete it
            </DialogDescription>
          </DialogHeader>

          <div className="inline-flex gap-2 w-full">
            <SearchForm
              placeholder="Search templates..."
              value={searchQuery}
              onInputChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            <Button 
              variant="destructive" 
              disabled={!selectedTemplateId || isDeleting}
              onClick={handleDeleteTemplate}
              className="flex-1"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/*Map Templates here*/}
          <div className="rounded-md bg-foreground/5 border border-zinc-200 h-[300px] p-4 w-full overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="space-y-2 w-2/3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="grid gap-2">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.template_id || template.formula_id}
                    className={`flex items-center p-2 px-4 border rounded-md justify-between font-medium text-sm cursor-pointer hover:bg-muted gap-2 ${
                      selectedTemplateId === template.template_id ? "bg-primary/10 border-primary" : "bg-background"
                    }`}
                    onClick={() => setSelectedTemplateId(template.template_id)}
                  >
                    {template.template_name}
                    {selectedTemplateId === template.template_id && (
                      <CheckIcon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground">No templates found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try a different search term"
                    : "Save your first template to get started"}
                </p>
              </div>
            )}
          </div>
          
          {/* Template action buttons moved to the bottom */}
          <div className="flex justify-between gap-2 w-full">
            <Button 
              variant="default" 
              disabled={!selectedTemplateId}
              onClick={() => selectedTemplateId && handleSelectTemplate(selectedTemplateId)}
              className="flex-1"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Apply Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template component */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger
          disabled={isDisabled}
          className="border rounded-md px-2 items-center gap-1 text-sm inline-flex whitespace-nowrap font-medium hover:text-blue-600 disabled:cursor-not-allowed"
        >
          <BookmarkIcon className="h-4 w-4" />
          <span className="">Save Template</span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save this Template?</DialogTitle>
            <DialogDescription>
              Save the current configuration as a template for quick access in
              the future
            </DialogDescription>
            <div className="flex flex-col gap-2 mt-2">
              <Label>Name</Label>
              <Input
                placeholder="Enter template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSaveTemplate}
              disabled={isSaving || !templateName.trim() || !selectedformulaId}
            >
              {isSaving ? (
                "Saving..."
              ) : (
                <>
               <CheckIcon className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
