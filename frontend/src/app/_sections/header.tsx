"use client";

import { CubeIcon } from "@heroicons/react/24/outline";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/hooks/hooks";
import BreadcrumbNav from "./nav-breadcrumb";

export default function Header() {
  const state = useAppSelector((state) => state.rootState);

  return (
    <div>
      <div className="flex flex-col gap-2 w-full h-full">
        <span className="flex flex-row gap-1 font-medium items-center">
          <CubeIcon className="w-5 h-5" />
          {state.currentAsset?.asset_name || "Loading..."}
        </span>
        <span className="flex flex-col gap-2">
          <BreadcrumbNav />

        </span>
      </div>
    </div>
  );
}
