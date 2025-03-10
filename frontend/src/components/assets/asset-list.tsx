"use client";

import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/hooks/hooks";
import { AssetItem } from "./asset-item";
import { Asset } from "@/models/asset";

interface AssetListProps {
  className?: string;
  onAssetChange: () => void;
}

export function AssetList({ className, onAssetChange }: AssetListProps) {
  const state = useAppSelector((state) => state.rootState);
  const [openAssetId, setOpenAssetId] = useState<number | null>(null);
  const initialized = useRef(false);

  // Only set the first asset open on initial load, not on every rerender
  useEffect(() => {
    if (state.assets?.length > 0 && !initialized.current) {
      setOpenAssetId(state.assets[0].asset_id);
      initialized.current = true;
    }
  }, [state.assets]);

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
