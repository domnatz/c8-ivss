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
} from "@/components/ui/sidebar";
import icon from "../../../public/icon_calibr8.png";
import { Masterlist } from "../models/masterlist";
import { Asset } from "../models/asset";
import { Subgroup_tag } from "../models/subgroup-tag";
import { Subgroup } from "../models/subgroup";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Initialize assets as an empty array with the type Asset[]
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [filter, setFilter] = React.useState("newest");
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter(); 

  // Fetch assets from backend
  React.useEffect(() => {
    fetch(`http://localhost:8000/assets`)
      .then((response) => response.json())
      .then(async (data) => {
        // Fetch subgroups for each asset
        const assetsWithSubgroups = await Promise.all(
          data.map(async (asset: Asset) => {
            try {
              const subgroupsResponse = await fetch(`http://localhost:8000/assets/${asset.asset_id}/subgroups`);
              if (subgroupsResponse.ok) {
                const subgroups = await subgroupsResponse.json();
                return { ...asset, subgroups: Array.isArray(subgroups) ? subgroups : [] };
              } else {
                return { ...asset, subgroups: [] };
              }
            } catch (error) {
              console.error(`Error fetching subgroups for asset ${asset.asset_id}:`, error);
              return { ...asset, subgroups: [] };
            }
          })
        );
        setAssets(assetsWithSubgroups);
      })
      .catch((error) => {
        console.error("There was an error fetching the assets!", error);
        setAssets([]); // Ensure assets is set to an empty array on error
      });
  }, []);

  // Add asset by calling backend API
  const addAsset = () => {
    fetch(`http://localhost:8000/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset_name: `New Asset`,
        asset_type: "unclassified",
      }),
    })
      .then((response) => response.json())
      .then((data) =>
        setAssets((prevAssets) => [
          ...(prevAssets || []),
          { ...data, subgroups: [] },
        ])
      )
      .catch((error) => {
        console.error("There was an error adding the asset!", error);
      });
  };

  const filterOptions = [
    { label: "Newest Added", value: "newest" },
    { label: "Oldest", value: "oldest" },
  ];

  // Upload masterlist by calling backend API
  const uploadMasterlist = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    fetch(`http://localhost:8000/upload_masterlist`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Masterlist uploaded successfully!", data);
        // Refresh assets if necessary
      })
      .catch((error) => {
        console.error("There was an error uploading the masterlist!", error);
      });
  };

  // Add subgroup to asset by calling backend API
  const addSubgroup = (asset_id: number) => {
    const payload = {
      subgroup_name: `New Subgroup`, // Only include subgroup_name
    };

    console.log("Sending payload:", payload); // Log the payload

    fetch(`http://localhost:8000/assets/${asset_id}/subgroups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            console.error("Server error details:", errorData); // Log server error details
            throw new Error(`Failed to add subgroup: ${JSON.stringify(errorData)}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Subgroup added successfully:", data); // Log success
        const updatedAssets = (assets || []).map((asset) => {
          if (asset.asset_id === asset_id) {
            return { ...asset, subgroups: [...(asset.subgroups || []), data] };
          }
          return asset;
        });
        setAssets(updatedAssets);
      })
      .catch((error) => {
        console.error("There was an error adding the subgroup!", error);
      });
  };

  // Rename subgroup by calling backend API
  const renameSubgroup = (
    asset_id: number,
    subgroup_id: number,
    newName: string
  ) => {
    fetch(`http://localhost:8000/subgroups/${subgroup_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subgroup_name: newName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedAssets = (assets || []).map((asset) => {
          if (asset.asset_id === asset_id) {
            return {
              ...asset,
              subgroups: asset.subgroups.map((subgroup) =>
                subgroup.subgroup_id === subgroup_id
                  ? { ...subgroup, subgroup_name: newName }
                  : subgroup
              ),
            };
          }
          return asset;
        });
        setAssets(updatedAssets);
      })
      .catch((error) => {
        console.error("There was an error renaming the subgroup!", error);
      });
  };

  // Rename asset by calling backend API
  const renameAsset = (asset_id: number, newTitle: string) => {
    fetch(`http://localhost:8000/assets/${asset_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset_name: newTitle,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedAssets = (assets || []).map((asset) =>
          asset.asset_id === asset_id ? { ...asset, asset_name: newTitle } : asset
        );
        setAssets(updatedAssets);
      })
      .catch((error) => {
        console.error("There was an error renaming the asset!", error);
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

  const sortedAssets = sortAssets(assets || [], filter);
  const filteredAndSortedAssets = sortedAssets.filter((asset) =>
    asset.asset_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-0">
        <div className="flex gap-2 w-full p-4 align-top">
          <Image src={icon} alt="Calibr8 Logo" className="w-10 rounded-full border-zinc-400 border" />
          <span className="flex flex-col">
            <span className="font-semibold">Calibr8</span>
            <span className="font-light text-xs">Philippines</span>
          </span>
        </div>

        <div className="p-2 border-b-[0.5px] items-start flex flex-col gap-2 justify-between">
          <Input
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="w-full file:text-sm rounded-sm"
            id="masterlist"
            onChange={(e) => {
              if (e.target.files) {
                uploadMasterlist(e.target.files[0]);
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
            onClick={addAsset}
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
                      onChange={(e) => renameAsset(asset.asset_id, e.target.value)}
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
                      onClick={() => addSubgroup(asset.asset_id)} // Pass the asset_id to the function
                    >
                      <span>Add Subgroup</span>
                      <PlusCircleIcon className="w-5 h-5" />
                    </Button>
                    {Array.isArray(asset.subgroups) && asset.subgroups.map((subgroup, subIndex) => (
                      <SidebarMenuItem key={subgroup.subgroup_id} className="pl-6">
                        <SidebarMenuButton asChild>
                          <div className="flex items-center justify-start w-full">
                            <ArrowTurnDownRightIcon className="w-5 h-5" />
                            <Input
                              value={subgroup.subgroup_name}
                              onChange={(e) =>
                                renameSubgroup(asset.asset_id, subgroup.subgroup_id, e.target.value)
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
                    ...
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