"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ReactNode;
  isActive: boolean;
}

interface NavMainProps {
  items: NavItem[];
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
}

export function NavMain({ items, activeItem, onItemClick }: NavMainProps) {
  const { setOpen } = useSidebar();

  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            tooltip={{
              children: item.title,
              hidden: false,
            }}
            onClick={() => {
              onItemClick(item);
              setOpen(true);
            }}
            isActive={activeItem?.title === item.title}
            className="px-2.5 md:px-2"
          >
            {item.icon}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
