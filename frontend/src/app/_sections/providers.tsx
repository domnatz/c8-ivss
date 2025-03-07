"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { store } from "@/store";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { AppSidebar } from "./app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Providers({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  return (
    <Provider store={store}>
      <SidebarProvider>
        <AppSidebar />
        {isMobile && <SidebarTrigger />}

        {children}
      </SidebarProvider>
    </Provider>
  );
}
