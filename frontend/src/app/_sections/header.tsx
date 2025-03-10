"use client";

import { CubeIcon } from "@heroicons/react/24/outline";
import { Label } from "@/components/ui/label";
import BreadcrumbNav from "../[assetId]/_section/BreadcrumbNav";
import { useAppSelector } from "@/hooks/hooks";

export default function Header() {
  const state = useAppSelector((state) => state.rootState);
  console.log("hey", state);

  return (
    <div>
      <div className="flex flex-col gap-2 w-full h-full">
        <span className="flex flex-row gap-1 font-medium items-center">
          <CubeIcon className="w-5 h-5" />
          {state.currentAsset?.asset_name || "Loading..."}
        </span>
        <span className="flex flex-col gap-2">
          <BreadcrumbNav />
          <Label
            htmlFor="subgroupsEdit"
            className="flex flex-col gap-1 justify-start text-left mt-2 w-full"
          >
            <span className="justify-start text-left flex flex-row w-full">
              Subgroups
            </span>
            <span className="text-xs font-normal text-zinc-500 flex justify-start text-left w-full">
              Please select a subgroup to edit
            </span>
          </Label>
        </span>
      </div>
    </div>
  );
}
