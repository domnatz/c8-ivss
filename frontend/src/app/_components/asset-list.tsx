"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { AssetItem } from "./asset-item";
import { Asset } from "@/models/asset";
import { createAsset } from "@/_actions/asset-actions";
import { toast } from "react-toastify";

export function AssetList({
  className,
  onAssetChange,
  onAssetSelect,
}: {
  className?: string;
  onAssetChange: () => void;
  onAssetSelect?: (asset: Asset) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const state = useAppSelector((state) => state.rootState);
  const [openAssetId, setOpenAssetId] = useState<number | null>(null);
  const initialized = useRef(false);

  // Only set the first asset open on initial load, not on every rerender
  useEffect(() => {
    if (state.assets?.length > 0 && !initialized.current) {
      setOpenAssetId(state.assets[0].asset_id);
      onAssetSelect?.(state.assets[0]);
      initialized.current = true;
    }
  }, [state.assets, onAssetSelect]);

  const handleAddAsset = () => {
    startTransition(async () => {
      try {
        const result = await createAsset(null);
        if (result.success) {
          toast.success("Asset created successfully");
          onAssetChange(); // Refresh the asset list
        } else {
          toast.error(`Failed to create asset: ${result.error}`);
        }
      } catch (error) {
        toast.error("An error occurred while creating the asset");
      }
    });
  };

  const sortAssets = (assets: Asset[], filter: string) => {
    switch (filter) {
      case "newest":
        return [...assets].reverse();
      case "oldest":
        return [...assets];
      default:
        return assets;
    }
  };

  const sortedAssets = sortAssets(state.assets || [], state.filter);
  const filteredAndSortedAssets = sortedAssets.filter((asset) =>
    asset.asset_name.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const handleAssetToggle = (assetId: number) => {
    setOpenAssetId(openAssetId === assetId ? null : assetId);

    // If we're opening an asset, find it and call onAssetSelect
    if (openAssetId !== assetId && onAssetSelect) {
      const selectedAsset = state.assets.find(
        (asset) => asset.asset_id === assetId
      );
      if (selectedAsset) {
        onAssetSelect(selectedAsset);
      }
    }
  };

  return (
    <div className={className}>
      {filteredAndSortedAssets.map((asset) => (
        <AssetItem
          key={asset.asset_id}
          asset={asset}
          onAssetChange={onAssetChange}
          isOpen={openAssetId === asset.asset_id}
          onToggle={handleAssetToggle}
        />
      ))}
    </div>
  );
}
