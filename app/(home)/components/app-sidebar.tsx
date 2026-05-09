"use client";

import * as React from "react";

import { AppLogo } from "@/app/(home)/components/app-logo";
import { NavMain } from "@/app/(home)/components/nav-main";
import { NavUser } from "@/app/(home)/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  HelpCircle,
  EarthIcon,
  HeartIcon,
  ArrowRightLeftIcon,
  HomeIcon,
} from "lucide-react";

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "#",
      icon: <HomeIcon />,
      isActive: true,
    },
    {
      title: "Explore countries",
      url: "#",
      icon: <EarthIcon />,
      isActive: false,
    },
    {
      title: "Saved destinations",
      url: "#",
      icon: <HeartIcon />,
      isActive: false,
    },
    {
      title: "Compare countries",
      url: "#",
      icon: <ArrowRightLeftIcon />,
      isActive: false,
    },
  ],
  mails: [],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState<{
    title: string;
    url: string;
    icon: React.ReactNode;
    isActive: boolean;
  }>(data.navMain[0]);
  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <NavMain
                items={data.navMain}
                activeItem={activeItem}
                onItemClick={setActiveItem}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuButton
            tooltip={{
              children: "Help",
              hidden: false,
            }}
          >
            <HelpCircle className="size-4" />
          </SidebarMenuButton>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-2 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground truncate">
              {activeItem?.title}
            </div>

            <SidebarTrigger className="-mr-1" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
