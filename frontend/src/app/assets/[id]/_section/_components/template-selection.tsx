import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import { ChevronUpDownIcon, BookmarkIcon } from "@heroicons/react/24/outline";

export default function TemplateSelector() {
  return (
    <div className="flex flex-row justify-between w-full gap-2">
      <div className="flex flex-row gap-2">
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        {/* Add Dialog component */}
        <Dialog>
          <DialogTrigger className="border rounded-md px-2 hover:text-blue-600">
            <ChevronUpDownIcon className="h-5 w-5" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      {/* Add Toggle component */}
      <Toggle variant="outline" className="data-[state=on]:bg-blue-50 data-[state=on]:text-blue-600 data-[state=on]:border-blue-200">
        <BookmarkIcon className="h-5 w-5" />
        Save Template
      </Toggle>
    </div>
  );
}
