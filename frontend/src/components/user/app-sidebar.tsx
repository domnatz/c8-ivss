"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { SearchForm } from "@/components/user/search-form";
import { PlusIcon, CubeIcon, AdjustmentsVerticalIcon, DocumentPlusIcon } from "@heroicons/react/24/outline";
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
import icon from "../../../public/icon-calibr8.png";

// Mock data
const initialData = {
  assets: [
    {
      asset_id: 1,
      asset_type: "unclassified",
      asset_name: "Transformer 1",
      subgroups: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
  ],
};

// Filter options
const filterOptions = [
  { label: "Newest Added", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A-Z", value: "asc" },
  { label: "Z-A", value: "desc" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [assets, setAssets] = React.useState(initialData.assets);

  // State to manage the selected filter
  const [filter, setFilter] = React.useState("newest");

  // Function to add a new asset
  const addAsset = () => {
    const newAsset = {
      title: `New Asset ${assets.length + 1}`, // Default name for the new asset
      url: "#",
      subgroups: [], // Start with no subgroups
    };
    setAssets([...assets, newAsset]);
    console.log("Asset added successfully");
  };

  // Function to handle renaming an asset
  const renameAsset = (index: number, newTitle: string) => {
    const updatedAssets = [...assets];
    updatedAssets[index].title = newTitle;
    setAssets(updatedAssets);
  };

  const sortAssets = (assets: typeof initialData.assets, filter: string) => {
    switch (filter) {
      case "newest":
        return [...assets].reverse(); // Newest added first
      case "oldest":
        return [...assets]; // Oldest first (original order)
      case "asc":
        return [...assets].sort((a, b) => a.title.localeCompare(b.title)); // A-Z
      case "desc":
        return [...assets].sort((a, b) => b.title.localeCompare(a.title)); // Z-A
      default:
        return assets;
    }
  };

  const sortedAssets = sortAssets(assets, filter);

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

        {/* Uploading of masterlist */}
        <div className="p-2 border-b-[0.5px] items-start flex flex-col gap-2 justify-between">
          
          <Input
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="w-full file:text-sm rounded-sm"
            id="masterlist"
          />
          <Button className="w-full rounded-sm">
            <DocumentPlusIcon className="w-5 h-5" />
            Upload Masterlist
            </Button>
        </div>

        <div className="flex flex-row w-full">
          <SearchForm className="w-full" />
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2">
              <AdjustmentsVerticalIcon className="w-5 h-5 text-zinc-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Map filter options */}
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

        <div className="flex justify-between w-full items-center pl-4 py-2 pr-3 border-y-[0.5px] border-zinc-300">
          <Label>Assets</Label>
          {/* Add assets button */}
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

      <SidebarContent className="gap-0">
        {/* Render sorted assets */}
        {sortedAssets.map((asset, index) => (
          <Collapsible
            key={index}
            title={asset.title}
            defaultOpen
            className="group/collapsible border-b-[0.5px] border-zinc-300"
          >
            <SidebarGroup className="py-0">
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  <div className="flex items-center justify-center">
                    <CubeIcon className="w-5 h-5 pr-1" />
                    {/* Editable asset title */}
                    <Input
                      value={asset.title}
                      onChange={(e) => renameAsset(index, e.target.value)}
                      className="border-none bg-transparent p-0 w-fit h-fit shadow-none focus:ring-0"
                    />
                  </div>
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  {/* Render subgroups */}
                  <SidebarMenu>
                    {asset.subgroups.map((subgroup, subIndex) => (
                      <SidebarMenuItem key={subIndex} className="pl-4">
                        <SidebarMenuButton asChild>
                          <a href={subgroup.url}>{subgroup.title}</a>
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