"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { AppSidebar } from "@/app/(home)/components/app-sidebar";
import { MapPanel } from "@/app/(home)/components/map-panel";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PromptBox } from "@/components/prompt-box";
import type {
  AgentUiEvent,
  ApplicantProfile,
  CountryRecommendation,
  ResearchStatus,
} from "@/lib/immigration/types";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function upsertRecommendation(
  recommendations: CountryRecommendation[],
  next: CountryRecommendation,
) {
  const withoutCurrent = recommendations.filter((item) => item.id !== next.id);
  return [...withoutCurrent, next].sort((a, b) => b.score - a.score);
}

export function ImmigrationAgentShell() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [profile, setProfile] = React.useState<ApplicantProfile | null>(null);
  const [recommendations, setRecommendations] = React.useState<
    CountryRecommendation[]
  >([]);
  const [selectedCountryId, setSelectedCountryId] = React.useState<string | null>(
    null,
  );
  const [status, setStatus] = React.useState<ResearchStatus>("idle");
  const [progressMessage, setProgressMessage] = React.useState<string | null>(
    null,
  );
  const [summary, setSummary] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const handleAgentEvent = React.useCallback((event: AgentUiEvent) => {
    switch (event.type) {
      case "profile_extracted":
        setProfile(event.profile);
        setProgressMessage("Profile understood. Building country shortlist...");
        break;
      case "progress":
        setProgressMessage(event.message);
        break;
      case "country_recommended":
        setRecommendations((current) => {
          const next = upsertRecommendation(
            current,
            event.recommendation,
          );
          setSelectedCountryId((selected) => selected ?? event.recommendation.id);
          return next;
        });
        setProgressMessage(`Added ${event.recommendation.country.name} to the map.`);
        break;
      case "research_complete":
        setStatus("complete");
        setSummary(event.summary);
        setProgressMessage(event.summary);
        setMessages((current) => [
          ...current,
          { role: "assistant", content: event.summary },
        ]);
        break;
      case "research_error":
        setStatus("error");
        setError(event.message);
        setProgressMessage(null);
        break;
    }
  }, []);

  const handleSend = React.useCallback(
    async ({ message }: { message: string }) => {
      const prompt = message.trim();
      if (!prompt) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: prompt },
      ];

      setMessages(nextMessages);
      setProfile(null);
      setRecommendations([]);
      setSelectedCountryId(null);
      setSummary(null);
      setError(null);
      setStatus("researching");
      setProgressMessage("Starting immigration research...");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: prompt, messages: nextMessages }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("The research agent did not return a stream.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            handleAgentEvent(JSON.parse(trimmed) as AgentUiEvent);
          }
        }

        const finalLine = buffer.trim();
        if (finalLine) {
          handleAgentEvent(JSON.parse(finalLine) as AgentUiEvent);
        }
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Research failed unexpectedly.";
        setStatus("error");
        setError(message);
        setProgressMessage(null);
      }
    },
    [handleAgentEvent, messages],
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as CSSProperties
      }
    >
      <AppSidebar
        recommendations={recommendations}
        selectedCountryId={selectedCountryId}
        researchStatus={status}
        progressMessage={progressMessage}
        profile={profile}
        summary={summary}
        error={error}
        onSelectCountry={setSelectedCountryId}
      />
      <SidebarInset>
        <div className="relative h-full w-full">
          <MapPanel
            recommendations={recommendations}
            selectedCountryId={selectedCountryId}
            onSelectRecommendation={setSelectedCountryId}
            onShowDetails={setSelectedCountryId}
          />
          <div className="fixed right-4 bottom-4 left-4 z-5 transition-[left,right,width] duration-200 ease-linear md:left-[calc(var(--sidebar-width)+1.5rem)] md:right-6 md:group-data-[state=collapsed]/sidebar-wrapper:left-[calc(var(--sidebar-width-icon)+1.5rem)] xl:right-102 motion-reduce:transition-none">
            {progressMessage || error ? (
              <div className="mx-auto mb-2 max-w-3xl rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300">
                {error ?? progressMessage}
              </div>
            ) : null}
            <PromptBox disabled={status === "researching"} onSend={handleSend} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
