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
import { Toggle } from "@/components/ui/toggle";
import {
  ChevronUpDownIcon,
  BookmarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/hooks/hooks";
import { Button } from "@/components/ui/button";
import { SearchForm } from "@/components/user/search-form";
import { saveTemplate } from "@/_actions/template-actions";

export default function TemplateSelector() {
  const subgroupTag = useAppSelector(
    (state) => state.assetState.selectedSubgroupTag
  );

  const selectedformulaId = useAppSelector(
    (state) => state.assetState.selectedFormulaId
  );

  // Add state variables for template name and save status
  const [templateName, setTemplateName] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);

  // Handle template save
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setSaveStatus({
        success: false,
        message: "Please enter a template name",
      });
      return;
    }

    if (!selectedformulaId) {
      setSaveStatus({
        success: false,
        message: "No formula selected to save as template",
      });
      return;
    }

    console.log(
      "Saving template:",
      templateName,
      "for formula:",
      selectedformulaId
    );

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const result = await saveTemplate({
        template_name: templateName,
        formula_id: Number(selectedformulaId),
      });

      console.log("Save result:", result);
      setSaveStatus(result);

      if (result.success) {
        console.log("🎉 Template saved successfully!");
        setTemplateName("");

        // Close dialog after success
        setTimeout(() => {
          setSaveDialogOpen(false);
          setSaveStatus(null);
          console.log("🔒 Save dialog closed");
        }, 2000);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus({
        success: false,
        message: "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
      console.log("⏹️ Template save process completed");
    }
  };

  return (
    <div className="flex flex-row justify-between w-full gap-2">
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Template" />
        </SelectTrigger>
        <SelectContent>
          {/* Map templates here maximum of 10 show newest */}
          <SelectItem value="light">Template</SelectItem>
        </SelectContent>
      </Select>

      {/* Expand Template component */}
      <Dialog>
        <DialogTrigger className="border rounded-md px-2 hover:text-blue-600">
          <ChevronUpDownIcon className="h-5 w-5" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Templates</DialogTitle>
            <DialogDescription>
              Select a saved template to apply to your current configuration
            </DialogDescription>
          </DialogHeader>
          {/* <SearchForm /> */}

          {/*Map Templates here*/}
          <div className="rounded-md bg-foreground/5 border border-zinc-200 h-full p-5 w-full overflow-y-auto"></div>
        </DialogContent>
      </Dialog>

      {/* Save Template component */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger className="border rounded-md px-2 items-center gap-1 text-sm inline-flex whitespace-nowrap font-medium hover:text-blue-600">
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

            {saveStatus && (
              <div
                className={`mt-3 p-2 rounded-md ${
                  saveStatus.success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                } flex items-center gap-2`}
              >
                {saveStatus.success ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5" />
                )}
                <span>{saveStatus.message}</span>
              </div>
            )}

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
