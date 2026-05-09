"use client";

import * as React from "react";

import { AppLogo } from "./app-logo";
import { CompareCountriesTab } from "./compare-countries-tab";
import { ExploreCountriesTab } from "./explore-countries-tab";
import { HistoryTab } from "./history-tab";
import { HomeTab } from "./home-tab";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
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
  ArrowRightLeftIcon,
  ClockIcon,
  EarthIcon,
  HelpCircle,
  HomeIcon,
} from "lucide-react";
import type {
  ApplicantProfile,
  ChatMessage,
  CountryRecommendation,
  ResearchStatus,
  SearchHistoryEntry,
} from "@/lib/immigration/types";

type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
  isActive: boolean;
};

const data: { navMain: NavItem[] } = {
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
      title: "History",
      url: "#",
      icon: <ClockIcon />,
      isActive: false,
    },
    {
      title: "Compare countries",
      url: "#",
      icon: <ArrowRightLeftIcon />,
      isActive: false,
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  recommendations?: CountryRecommendation[];
  selectedCountryId?: string | null;
  researchStatus?: ResearchStatus;
  progressMessage?: string | null;
  profile?: ApplicantProfile | null;
  summary?: string | null;
  error?: string | null;
  historyItems?: SearchHistoryEntry[];
  messages?: ChatMessage[];
  onSelectCountry?: (countryId: string | null) => void;
  onSelectHistory?: (entry: SearchHistoryEntry) => void;
};

export function AppSidebar({
  recommendations = [],
  selectedCountryId = null,
  researchStatus = "idle",
  progressMessage = null,
  profile = null,
  summary = null,
  error = null,
  historyItems = [],
  messages = [],
  onSelectCountry = () => undefined,
  onSelectHistory = () => undefined,
  ...props
}: AppSidebarProps) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState<NavItem>(data.navMain[0]);

  const handleSelectHistory = React.useCallback(
    (entry: SearchHistoryEntry) => {
      onSelectHistory(entry);
      setActiveItem(data.navMain[1]);
    },
    [onSelectHistory],
  );

  const renderActiveTab = () => {
    switch (activeItem.title) {
      case "Explore countries":
        return (
          <ExploreCountriesTab
            recommendations={recommendations}
            selectedCountryId={selectedCountryId}
            researchStatus={researchStatus}
            progressMessage={progressMessage}
            error={error}
            onSelectCountry={onSelectCountry}
          />
        );
      case "History":
        return (
          <HistoryTab
            historyItems={historyItems}
            onSelectHistory={handleSelectHistory}
          />
        );
      case "Compare countries":
        return <CompareCountriesTab recommendations={recommendations} />;
      case "Home":
      default:
        return (
          <HomeTab
            researchStatus={researchStatus}
            progressMessage={progressMessage}
            profile={profile}
            summary={summary}
            error={error}
            messages={messages}
          />
        );
    }
  };

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
            <div className="text-foreground truncate text-base font-medium">
              {activeItem?.title}
            </div>

            <SidebarTrigger className="-mr-1" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>{renderActiveTab()}</SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
