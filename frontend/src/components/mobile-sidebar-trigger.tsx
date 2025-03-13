"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export const MobileSidebarTrigger = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="fixed bottom-4 right-4 z-50 rounded-full bg-primary p-3 text-white shadow-lg"
      aria-label="Toggle Sidebar"
    >
      <Menu size={24} />
    </button>
  );
};
