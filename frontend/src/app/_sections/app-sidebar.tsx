"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SearchForm } from "@/components/user/search-form";
import {
  PlusIcon,
  CubeIcon,
  AdjustmentsVerticalIcon,
  DocumentPlusIcon,
  PlusCircleIcon,
  ArrowTurnDownRightIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import icon from "../../../public/icon_calibr8.png";
import { Asset } from "../../models/asset";
import {
  createAsset,
  createSubgroup,
  updateAssetName,
  updateSubgroupName,
} from "@/_actions/asset-actions";
import {
  filterOptions,
  getAssets,
  uploadMasterlist,
} from "@/_services/asset-service";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  // Initialize assets as an empty array with the type Asset[]
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [filter, setFilter] = React.useState("newest");
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();

  // Fetch assets from backend
  const fetchAssets = React.useCallback(async () => {
    try {
      const assetsData = await getAssets();
      setAssets(assetsData);
    } catch (error) {
      console.error("There was an error fetching the assets!", error);
      setAssets([]);
    }
  }, []);

  React.useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

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

  const sortedAssets = sortAssets(assets || [], filter);
  const filteredAndSortedAssets = sortedAssets.filter((asset) =>
    asset.asset_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAsset = async () => {
    await createAsset();
    fetchAssets(); // Refresh assets after adding
  };

  const handleAddSubgroup = async (assetId: number) => {
    await createSubgroup(assetId);
    fetchAssets(); // Refresh assets after adding subgroup
  };

  const handleRenameAsset = async (assetId: number, newName: string) => {
    await updateAssetName(assetId, newName);
    fetchAssets(); // Refresh assets after renaming
  };

  const handleRenameSubgroup = async (
    assetId: number,
    subgroupId: number,
    newName: string
  ) => {
    await updateSubgroupName(assetId, subgroupId, newName);
    fetchAssets(); // Refresh assets after renaming subgroup
  };

  const handleUploadMasterlist = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadMasterlist(file);
      const data = await response.json();
      console.log("Masterlist uploaded successfully!", data);
      fetchAssets(); // Refresh assets after upload
    } catch (error) {
      console.error("There was an error uploading the masterlist!", error);
    }
  };

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

        <div className="p-2 border-b-[0.5px] items-start flex flex-col gap-2 justify-between">
          <Input
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="w-full file:text-sm rounded-sm"
            id="masterlist"
            onChange={(e) => {
              if (e.target.files) {
                handleUploadMasterlist(e.target.files[0]);
              }
            }}
          />
          <Button className="w-full rounded-sm">
            <DocumentPlusIcon className="w-5 h-5" />
            Upload Masterlist
          </Button>
        </div>

        <div className="flex flex-row w-full gap-2 px-2">
          <SearchForm
            className="w-full h-full"
            value={searchQuery}
            onInputChange={(e) => setSearchQuery(e.target.value)}
          />

          <DropdownMenu>
            <DropdownMenuTrigger className="p-2">
              <AdjustmentsVerticalIcon className="w-5 h-5 text-zinc-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setFilter(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add Assets Button */}
        <div className="flex justify-between w-full items-center pl-4 pr-2 border-y-[0.5px] border-zinc-300">
          <Label>Assets</Label>
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-foreground/50 cursor-pointer"
            onClick={handleAddAsset}
          >
            <PlusIcon className="w-5 h-5" />
          </Button>
        </div>
      </SidebarHeader>

      {/* Where it maps Assets */}
      <SidebarContent className="gap-0">
        {filteredAndSortedAssets.map((asset) => (
          <Collapsible
            key={asset.asset_id}
            defaultOpen
            className="group/collapsible border-b-[0.5px] border-zinc-300"
          >
            <SidebarGroup className="py-0">
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger
                  onClick={() => {
                    // Navigate to the asset's page
                    router.push(`/${asset.asset_id}`);
                  }}
                >
                  <div className="flex items-center justify-center">
                    <CubeIcon className="w-5 h-5 pr-1" />
                    <Input
                      value={asset.asset_name}
                      onChange={(e) =>
                        handleRenameAsset(asset.asset_id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className="border-none bg-transparent p-0 w-fit h-fit shadow-none focus:ring-0"
                      onClick={(e) => e.stopPropagation()} // Prevent the CollapsibleTrigger from toggling when clicking the input
                    />
                  </div>
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {/* Add Subgroup Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-between text-xs"
                      onClick={() => handleAddSubgroup(asset.asset_id)} // Pass the asset_id to the function
                    >
                      <span>Add Subgroup</span>
                      <PlusCircleIcon className="w-5 h-5" />
                    </Button>
                    {Array.isArray(asset.subgroups) &&
                      asset.subgroups.map((subgroup, subIndex) => (
                        <SidebarMenuItem
                          key={subgroup.subgroup_id}
                          className="pl-6"
                        >
                          <SidebarMenuButton asChild>
                            <div className="flex items-center justify-start w-full">
                              <ArrowTurnDownRightIcon className="w-5 h-5" />
                              <Input
                                value={subgroup.subgroup_name}
                                onChange={(e) =>
                                  handleRenameSubgroup(
                                    asset.asset_id,
                                    subgroup.subgroup_id,
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="border-none bg-transparent p-0 w-fit h-fit shadow-none focus:ring-0 font-medium"
                                onClick={(e) => e.stopPropagation()} // Prevent CollapsibleTrigger from toggling
                              />
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
