import { AppSidebar } from "@/app/(home)/components/app-sidebar";
import { Map, MapControls } from "@/components/ui/map";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Searchbar } from "@/components/search-bar";

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <div className="relative h-full">
          <div className="border-border/40 bg-background/70 absolute top-3.5 left-4 z-20 flex items-center gap-3 rounded-lg border backdrop-blur-sm">
            <Searchbar className="" />
          </div>
          <Map center={[18, 18]} zoom={1.5} projection={{ type: "globe" }}>
            <MapControls
              position="bottom-right"
              showZoom
              // showCompass
              showLocate
              showFullscreen
            />
          </Map>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
