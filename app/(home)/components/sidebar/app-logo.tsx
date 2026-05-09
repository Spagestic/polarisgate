import * as React from "react";
import { PanelLeftIcon, TerminalIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppLogo() {
  const { state, setOpen } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="md:h-8 md:p-0"
          render={<a href="#" />}
        >
          <div
            className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground group"
            onClick={(e) => {
              if (state === "collapsed") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            role={state === "collapsed" ? "button" : undefined}
          >
            {state === "collapsed" ? (
              <>
                <TerminalIcon className="size-4 group-hover:hidden" />
                <PanelLeftIcon className="hidden group-hover:block size-4" />
              </>
            ) : (
              <TerminalIcon className="size-4" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Acme Inc</span>
            <span className="truncate text-xs">Enterprise</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
