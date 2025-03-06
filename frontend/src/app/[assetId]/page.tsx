"use client";

import { useParams } from "next/navigation";
import BreadcrumbNav from "./BreadcrumbNav";
import { Label } from "@/components/ui/label";
import SubgroupEdit from "./SubgroupEdit";
import { CubeIcon } from "@heroicons/react/24/outline";
import { Asset, mockAssets } from "@/components/user/app-sidebar"; // Import mockAssets and Asset type

export default function AssetDetails() {
  const params = useParams(); // Get dynamic route parameters
  const { assetId } = params; // Extract the dynamic route parameter

  // Find the asset based on assetId
  const selectedAsset = mockAssets.find(
    (asset) => asset.asset_id === Number(assetId)
  );

  // If the asset is not found, display a message
  if (!selectedAsset) {
    return (
      <div className="px-6 py-4 w-full h-full">
        <div className="flex flex-col gap-2 w-full h-full">
          <span className="flex flex-row gap-1 font-medium items-center">
            <CubeIcon className="w-5 h-5" />
            Asset Not Found
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 w-full h-full">
      <div className="flex flex-col gap-2 w-full h-full">
        <span className="flex flex-row gap-1 font-medium items-center">
          <CubeIcon className="w-5 h-5" />
          {selectedAsset.asset_name} {/* Display the asset name */}
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
        {/* Subgroups edit section */}
        <div className="flex flex-col sm:flex-row gap-4 grid-cols-2 h-full">
          <SubgroupEdit />
          <SubgroupEdit />
        </div>
      </div>
    </div>
  );
}