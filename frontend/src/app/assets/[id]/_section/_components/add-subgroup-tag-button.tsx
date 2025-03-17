import  * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface AddSubgroupTagButtonProps {
    className?: string;
    buttonText?: "Add Subgroup Tag";
}

export default function AddSubgroupTagButton( { className, buttonText = "Add Subgroup Tag"}: AddSubgroupTagButtonProps ) {
    return (
        <div>
        <Dialog>
          <DialogTrigger className="border bg-foreground text-background px-4 py-1 w-full flex flex-row rounded-md items-center gap-2">
            <PlusCircleIcon className="h-5 w-5" />
            {buttonText}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subgroup Tags</DialogTitle>
              <DialogDescription>
                Select a Subgroup first then add a tag
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        </div>
    );
}