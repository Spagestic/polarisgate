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
  ArrowLeftIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileCheckIcon,
  Loader2Icon,
  WalletIcon,
} from "lucide-react";
import type {
  ApplicantProfile,
  CountryRecommendation,
  ResearchStatus,
} from "@/lib/immigration/types";

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
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  recommendations?: CountryRecommendation[];
  selectedCountryId?: string | null;
  researchStatus?: ResearchStatus;
  progressMessage?: string | null;
  profile?: ApplicantProfile | null;
  summary?: string | null;
  error?: string | null;
  onSelectCountry?: (countryId: string | null) => void;
};

function formatCurrency(value: number | null) {
  if (typeof value !== "number") return "Varies";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTimeline(months: [number, number]) {
  return `${months[0]}-${months[1]} months`;
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
      <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-full">
        <EarthIcon className="text-muted-foreground size-5" />
      </div>
      <h3 className="text-sm font-semibold">Find your migration shortlist</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        Describe your country of residence, age, savings, and goals. The agent
        will research pathways and place recommended countries on the map.
      </p>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  selected,
  onSelect,
}: {
  recommendation: CountryRecommendation;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition-colors ${
        selected
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
          : "hover:bg-muted/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{recommendation.country.name}</p>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
            {recommendation.bestPathway}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {recommendation.score}%
        </span>
      </div>
      <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5" />
          {formatTimeline(recommendation.prTimelineMonths)}
        </span>
        <span className="inline-flex items-center gap-1">
          <WalletIcon className="size-3.5" />
          {formatCurrency(recommendation.minSavingsUsd)}
        </span>
      </div>
    </button>
  );
}

function RecommendationDetails({
  recommendation,
  onBack,
}: {
  recommendation: CountryRecommendation;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <button
        type="button"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeftIcon className="size-4" />
        Back to recommendations
      </button>

      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {recommendation.country.region ?? "Destination"}
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          {recommendation.country.name}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {recommendation.summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border p-3">
          <p className="text-muted-foreground text-xs">Fit score</p>
          <p className="mt-1 text-lg font-semibold">{recommendation.score}%</p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-muted-foreground text-xs">PR timeline</p>
          <p className="mt-1 text-lg font-semibold">
            {formatTimeline(recommendation.prTimelineMonths)}
          </p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold">Best pathway</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {recommendation.bestPathway}
        </p>
      </section>

      <section>
        <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
          <FileCheckIcon className="size-4" />
          Documents to prepare
        </h3>
        <div className="space-y-1.5">
          {recommendation.documents.map((document) => (
            <div
              key={document}
              className="bg-muted/60 rounded-lg px-3 py-2 text-sm"
            >
              {document}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Eligibility notes</h3>
        <ul className="text-muted-foreground mt-2 space-y-2 text-sm leading-6">
          {recommendation.eligibilityNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Cautions</h3>
        <ul className="text-muted-foreground mt-2 space-y-2 text-sm leading-6">
          {recommendation.cautions.map((caution) => (
            <li key={caution}>{caution}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Sources</h3>
        <div className="mt-2 space-y-2">
          {recommendation.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="hover:bg-muted flex items-start gap-2 rounded-lg border p-2 text-sm"
            >
              <ExternalLinkIcon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
              <span>
                <span className="line-clamp-2">{source.title}</span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  {source.publisher}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function ResultsContent({
  recommendations,
  selectedCountryId,
  researchStatus,
  progressMessage,
  profile,
  summary,
  error,
  onSelectCountry,
}: Required<
  Pick<
    AppSidebarProps,
    | "recommendations"
    | "researchStatus"
    | "onSelectCountry"
  >
> &
  Pick<
    AppSidebarProps,
    "selectedCountryId" | "progressMessage" | "profile" | "summary" | "error"
  >) {
  const selectedRecommendation = recommendations.find(
    (recommendation) => recommendation.id === selectedCountryId,
  );

  if (selectedRecommendation) {
    return (
      <RecommendationDetails
        recommendation={selectedRecommendation}
        onBack={() => onSelectCountry(null)}
      />
    );
  }

  if (recommendations.length === 0 && researchStatus === "idle") {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4 p-4">
      {researchStatus === "researching" ? (
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2Icon className="size-4 animate-spin" />
            Agent researching
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {progressMessage ?? "Finding official sources and ranking routes..."}
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {profile ? (
        <div className="rounded-xl border p-3 text-sm">
          <p className="font-medium">Applicant profile</p>
          <p className="text-muted-foreground mt-1 leading-6">
            {profile.age ? `${profile.age} years old` : "Age unknown"}
            {profile.residenceCountry
              ? `, resident of ${profile.residenceCountry}`
              : ""}
            {profile.savingsUsd
              ? `, ${formatCurrency(profile.savingsUsd)} savings`
              : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.goals.map((goal) => (
              <span
                key={goal}
                className="bg-muted rounded-full px-2 py-1 text-xs"
              >
                {goal.replace("_", " ")}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {recommendations.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recommended destinations</h3>
            <span className="text-muted-foreground text-xs">
              {recommendations.length} found
            </span>
          </div>
          <div className="space-y-2">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                selected={recommendation.id === selectedCountryId}
                onSelect={() => onSelectCountry(recommendation.id)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {summary && researchStatus === "complete" ? (
        <p className="text-muted-foreground text-sm leading-6">{summary}</p>
      ) : null}
    </div>
  );
}

export function AppSidebar({
  recommendations = [],
  selectedCountryId = null,
  researchStatus = "idle",
  progressMessage = null,
  profile = null,
  summary = null,
  error = null,
  onSelectCountry = () => undefined,
  ...props
}: AppSidebarProps) {
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
            <SidebarGroupContent>
              <ResultsContent
                recommendations={recommendations}
                selectedCountryId={selectedCountryId}
                researchStatus={researchStatus}
                progressMessage={progressMessage}
                profile={profile}
                summary={summary}
                error={error}
                onSelectCountry={onSelectCountry}
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
