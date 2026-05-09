import type { CSSProperties } from "react";
import { AppSidebar } from "@/app/(home)/components/app-sidebar";
import { MapPanel } from "@/app/(home)/components/map-panel";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PromptBox } from "@/components/prompt-box";

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
        <div className="relative w-full h-full">
          <MapPanel />
          <div className="fixed bottom-4 left-4 right-4 z-5 transition-[left,right,width] duration-200 ease-linear md:left-[calc(var(--sidebar-width)+1.5rem)] md:right-6 md:group-data-[state=collapsed]/sidebar-wrapper:left-[calc(var(--sidebar-width-icon)+1.5rem)] xl:right-102 motion-reduce:transition-none">
            <PromptBox />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
