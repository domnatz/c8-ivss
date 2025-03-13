"use client";

import { Asset } from "@/models/asset";
import { useEffect, useState } from "react";
import SubgroupEdit from "./SubgroupEdit";
import SubgroupTagEdit from "./SubgroupTagEdit";
import { getAssetById } from "@/_services/asset-service";
import { Subgroup_tag } from "@/models/subgroup-tag"; // Import Subgroup_tag
import { useAppSelector, useAppDispatch } from "@/hooks/hooks"; // Import hooks
import { assetAction } from "@/app/assets/[id]/_redux/asset-slice"; // Import actions
import { toast } from "react-toastify";

export default function AssetDetails({ params }: { params: number }) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedSubgroupTag: Subgroup_tag | null = useAppSelector(
    (state) => state.assetState.selectedSubgroupTagId
  ); // Use useAppSelector to get selectedSubgroupTagId from the Redux store
  const dispatch = useAppDispatch(); // Add this line to use dispatch

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        setLoading(true);
        const asset = await getAssetById(params);
        setSelectedAsset(asset);
      } catch (err: any) {
        toast.error("Failed to load asset details");
        setSelectedAsset(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [params]);

  if (loading) {
    return <div>Loading asset details...</div>;
  }

  return (
    <div className="py-4 w-full h-full">
      <div className="flex flex-col sm:flex-row gap-4 grid-cols-2 h-full">
        <SubgroupEdit
          selectedAsset={selectedAsset}
          assetId={params}
          onSelectSubgroupTag={(tag) =>
            dispatch(assetAction.selectSubgroupTag(tag))
          }
          onDeselectSubgroupTag={() =>
            dispatch(assetAction.selectSubgroupTag(null))
          }
        />
        <SubgroupTagEdit
          selectedSubgroupTag={selectedSubgroupTag}
          assetId={params}
        />
      </div>
    </div>
  );
}
