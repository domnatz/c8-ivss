"use client";

import { CubeIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import SubgroupEdit from "./SubgroupEdit";
import SubgroupTagEdit from "./SubgroupTagEdit";
import { getAssetById } from "@/_services/asset-service";
import { useAppSelector, useAppDispatch } from "@/hooks/hooks";
import { assetAction } from "@/app/assets/[id]/_redux/asset-slice";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssetDetails() {
  const params = useParams();
  const dispatch = useAppDispatch();

  // Get the raw param value for debugging
  const rawId = params.id;
  // Make sure we're using the correct parameter name and properly convert to number
  const numericAssetId = typeof rawId === "string" ? parseInt(rawId, 10) : NaN;

  // Get state from Redux instead of local state
  const selectedAsset = useAppSelector((state) => state.assetState.selectedAsset);
  const loading = useAppSelector((state) => state.assetState.loading);
  const error = useAppSelector((state) => state.assetState.error);
  const selectedSubgroupTag = useAppSelector((state) => state.assetState.selectedSubgroupTag);

  useEffect(() => {
    // Log the raw and parsed values for debugging
    console.log("Raw ID param:", rawId);
    console.log("Parsed numeric asset ID:", numericAssetId);

    if (!numericAssetId || isNaN(numericAssetId)) {
      dispatch(assetAction.setError(`Invalid asset ID: ${rawId}`));
      dispatch(assetAction.setLoading(false));
      return;
    }

    const fetchAssetDetails = async () => {
      try {
        dispatch(assetAction.setLoading(true));
        const asset = await getAssetById(numericAssetId);
        dispatch(assetAction.setSelectedAsset(asset));
        dispatch(assetAction.setError(null));
      } catch (err: any) {
        console.error("Error fetching asset details:", err);
        // Provide more detailed error message
        dispatch(assetAction.setError(err?.message || "Failed to load asset details"));
        dispatch(assetAction.setSelectedAsset(null));
      } finally {
        dispatch(assetAction.setLoading(false));
      }
    };

    fetchAssetDetails();
  }, [rawId, numericAssetId, dispatch]);

  if (loading) {
    return <div className="flex flex-row gap-4 w-full h-full py-4">
      <Skeleton className="w-full "/>
      <Skeleton className="w-full " />
    </div>;
  }

  if (error || !selectedAsset) {
    return (
      <div className="py-4 w-full h-full">
        <div className="flex flex-col gap-2 w-full h-full">
          <span className="flex flex-row gap-1 font-medium items-center">
            <CubeIcon className="w-5 h-5" />
            {error || "Asset Not Found"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 w-full h-full">
      <div className="flex flex-col sm:flex-row gap-4 grid-cols-2 h-full">
        <SubgroupEdit />
        <SubgroupTagEdit selectedSubgroupTag={selectedSubgroupTag} />
      </div>
    </div>
  );
}