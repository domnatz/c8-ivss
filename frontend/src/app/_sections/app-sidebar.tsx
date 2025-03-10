"use client";

import * as React from "react";
import { useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import icon from "../../../public/icon_calibr8.png";
import { getAssets } from "@/_services/asset-service";
import { rootActions } from "../_redux/root-slice";
import { useAppDispatch } from "@/hooks/hooks";
import { FilterAssets } from "@/components/assets/filter-assets";
import { UploadMasterlist } from "@/components/assets/upload-masterlist";
import { AddAssetButton } from "@/components/assets/add-asset-button";
import { AssetList } from "@/components/assets/asset-list";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useAppDispatch();

  // Non-async function to fetch assets
  const fetchAssets = useCallback(() => {
    getAssets()
      .then((data) => {
        dispatch(rootActions.assetsSet(data));
      })
      .catch((error) => {
        console.error("There was an error fetching the assets!", error);
        dispatch(rootActions.assetsSet([]));
      });
  }, [dispatch]);

  // Load assets on component mount
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-0">
        <div className="flex gap-2 w-full p-4 align-top">
          <div className="flex-row flex gap-2">
            <Image
              src={icon}
              alt="Calibr8 Logo"
              className="w-10 rounded-full border-zinc-400 border"
            />
            <span className="flex flex-col">
              <span className="font-semibold">Calibr8</span>
              <span className="font-light text-xs">Philippines</span>
            </span>
          </div>
        </div>

        {/* Upload Masterlist Component */}
        <UploadMasterlist onUploadSuccess={fetchAssets} />

        {/* Filter Assets Component */}
        <div className="px-2">
          <FilterAssets />
        </div>

        {/* Add Assets Button Component */}
        <AddAssetButton />
      </SidebarHeader>

      {/* Asset List Component */}
      <SidebarContent className="gap-0">
        <AssetList onAssetChange={fetchAssets} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
