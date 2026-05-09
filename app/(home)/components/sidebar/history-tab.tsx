"use client";

import { ClockIcon } from "lucide-react";

import type { SearchHistoryEntry } from "@/lib/immigration/types";

type HistoryTabProps = {
  historyItems: SearchHistoryEntry[];
  onSelectHistory: (entry: SearchHistoryEntry) => void;
};

function formatHistoryDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function HistoryTab({ historyItems, onSelectHistory }: HistoryTabProps) {
  if (historyItems.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-5 text-center">
        <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-full">
          <ClockIcon className="text-muted-foreground size-5" />
        </div>
        <h3 className="text-sm font-semibold">No searches yet</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Completed immigration searches will be saved here so you can reopen
          the prompt, map markers, and country recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="space-y-2">
        {historyItems.map((historyItem) => {
          const topCountries = historyItem.recommendations
            .slice(0, 3)
            .map((recommendation) => recommendation.country.name)
            .join(", ");

          return (
            <button
              key={historyItem._id}
              type="button"
              onClick={() => onSelectHistory(historyItem)}
              className="hover:bg-muted/70 w-full rounded-xl border p-3 text-left transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-2 text-sm font-medium">
                  {historyItem.prompt}
                </p>
                <span className="text-muted-foreground shrink-0 text-[11px]">
                  {formatHistoryDate(historyItem.createdAt)}
                </span>
              </div>
              {topCountries ? (
                <p className="text-muted-foreground mt-2 line-clamp-1 text-xs">
                  {topCountries}
                </p>
              ) : null}
              <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
                <span>{historyItem.recommendations.length} destinations</span>
                <span>{historyItem.messages.length} messages</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
