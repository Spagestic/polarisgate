import type { CSSProperties } from "react";
import { AppSidebar } from "@/app/(home)/components/app-sidebar";
import { MapPanel } from "@/app/(home)/components/map-panel";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <div className="relative h-full">
          <MapPanel />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
