"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppSelector } from "@/hooks/hooks";

export default function BreadcrumbNav() {
  const state = useAppSelector((state) => state.rootState);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
          <BreadcrumbItem >
              {state.currentAsset?.asset_name || "Loading..."}
          </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
