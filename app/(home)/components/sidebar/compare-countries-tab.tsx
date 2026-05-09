"use client";

import { ArrowRightLeftIcon } from "lucide-react";

export function CompareCountriesTab() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 text-center">
      <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-full">
        <ArrowRightLeftIcon className="text-muted-foreground size-5" />
      </div>
      <h3 className="text-sm font-semibold">Compare countries</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        Select destinations from Explore Countries to compare pathways,
        timelines, costs, and cautions side by side.
      </p>
    </div>
  );
}
