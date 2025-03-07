"use client";

import { useParams } from "next/navigation";
import BreadcrumbNav from "./BreadcrumbNav";
import { Label } from "@/components/ui/label";
import SubgroupEdit from "./SubgroupEdit";
import { CubeIcon } from "@heroicons/react/24/outline";
import { Asset } from "@/components/user/app-sidebar"; 
import SubgroupTagEdit from "./SubgroupTagEdit";
import { useEffect, useState } from "react";

export default function AssetDetails() {
  const params = useParams(); 
  const numericAssetId = Number(params.assetId); // Convert assetId to a number
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null); 

  useEffect(() => {
    if (!numericAssetId) return; // Prevent fetch if assetId is invalid

    // Fetch the asset details
    fetch(`http://localhost:8000/assets/${numericAssetId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching asset details: ${response.statusText}`);
        }
        return response.json();
      })
      .then(async (data) => {
        // Fetch subgroups for the asset
        const subgroupsResponse = await fetch(`http://localhost:8000/assets/${numericAssetId}/subgroups`);
        if (subgroupsResponse.ok) {
          const subgroups = await subgroupsResponse.json();
          setSelectedAsset({ ...data, subgroups: Array.isArray(subgroups) ? subgroups : [] });
        } else {
          setSelectedAsset({ ...data, subgroups: [] });
        }
      })
      .catch((error) => {
        console.error("Error fetching asset details!", error);
        setSelectedAsset(null);
      });
  }, [numericAssetId]);

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
          {selectedAsset.asset_name}
        </span>
        <span className="flex flex-col gap-2">
          <BreadcrumbNav />
          <Label htmlFor="subgroupsEdit" className="flex flex-col gap-1 justify-start text-left mt-2 w-full">
            <span className="justify-start text-left flex flex-row w-full">
              Subgroups
            </span>
            <span className="text-xs font-normal text-zinc-500 flex justify-start text-left w-full">
              Please select a subgroup to edit
            </span>
          </Label>
        </span>
        <div className="flex flex-col sm:flex-row gap-4 grid-cols-2 h-full">
          <SubgroupEdit selectedAsset={selectedAsset} />
          <SubgroupTagEdit />
        </div>
      </div>
    </div>
  );
}
