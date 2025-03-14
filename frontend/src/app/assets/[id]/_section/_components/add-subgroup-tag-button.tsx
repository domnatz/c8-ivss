import  * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface AddSubgroupTagButtonProps {
    className?: string;
    buttonText?: string;
}

export default function AddSubgroupTagButton( { className }: AddSubgroupTagButtonProps ) {
    return (
        <div className=''>
        <Dialog>
          <DialogTrigger className="border bg-orange-500 text-white px-4 py-1 w-full flex flex-row rounded-md items-center gap-2">
            <PlusCircleIcon className="h-5 w-5" />
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
    );
}