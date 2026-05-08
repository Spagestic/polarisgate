import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function MapControlsCard() {
  return (
    <div className="border-border/40 bg-background/70 absolute top-4 left-4 z-20 flex items-center gap-3 rounded-lg border px-2.5 py-1.5 backdrop-blur-sm">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4!" />
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: "#22c55e" }}
          />
          <span>Strong</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: "#f59e0b" }}
          />
          <span>Possible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
          />
          <span>Difficult</span>
        </div>
      </div>
    </div>
  );
}
