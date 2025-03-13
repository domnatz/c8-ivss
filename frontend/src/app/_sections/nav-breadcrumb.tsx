"use client";

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
          <BreadcrumbLink href="/assets">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {state.currentAsset?.asset_name || "Loading..."}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
