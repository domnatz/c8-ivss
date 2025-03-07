"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BreadcrumbNav() {
  const pathname = usePathname(); // Get the current path

  // Split the pathname to generate breadcrumb links
  const paths = pathname.split("/").filter(Boolean); // Remove empty strings

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          return (
            <BreadcrumbItem key={index}>
              {isLast ? (
                <BreadcrumbLink href={href}>{path}</BreadcrumbLink>
              ) : (
                <BreadcrumbLink href={href}>{path}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
