"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { useMutation, useQuery } from "convex/react";
import { AppSidebar } from "@/app/(home)/components/sidebar/app-sidebar";
import { MapPanel } from "@/app/(home)/components/map-panel";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PromptBox } from "@/components/prompt-box";
import { api } from "@/convex/_generated/api";
import type {
  AgentUiEvent,
  ApplicantProfile,
  ChatMessage,
  CountryRecommendation,
  ResearchStatus,
  SearchHistoryEntry,
} from "@/lib/immigration/types";

function upsertRecommendation(
  recommendations: CountryRecommendation[],
  next: CountryRecommendation,
) {
  const withoutCurrent = recommendations.filter((item) => item.id !== next.id);
  return [...withoutCurrent, next].sort((a, b) => b.score - a.score);
}

function toNumberPair(values: number[]): [number, number] {
  const first = values[0] ?? 0;
  return [first, values[1] ?? first];
}

function normalizeRecommendation(
  recommendation: CountryRecommendation,
): CountryRecommendation {
  const { country } = recommendation;

  return {
    ...recommendation,
    country: {
      name: country.name,
      officialName: country.officialName,
      iso2: country.iso2,
      iso3: country.iso3,
      capital: country.capital,
      region: country.region,
      subregion: country.subregion,
      flag: country.flag,
      latitude: country.latitude,
      longitude: country.longitude,
      areaKm2: country.areaKm2,
    },
  };
}

export default function Page() {
  const historyItems = useQuery(api.searchHistory.listMine);
  const saveHistory = useMutation(api.searchHistory.save);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [profile, setProfile] = React.useState<ApplicantProfile | null>(null);
  const [recommendations, setRecommendations] = React.useState<
    CountryRecommendation[]
  >([]);
  const [selectedCountryId, setSelectedCountryId] = React.useState<
    string | null
  >(null);
  const [status, setStatus] = React.useState<ResearchStatus>("idle");
  const [progressMessage, setProgressMessage] = React.useState<string | null>(
    null,
  );
  const [summary, setSummary] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const currentPromptRef = React.useRef<string | null>(null);
  const recommendationsRef = React.useRef<CountryRecommendation[]>([]);
  const messagesRef = React.useRef<ChatMessage[]>([]);

  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  React.useEffect(() => {
    recommendationsRef.current = recommendations;
  }, [recommendations]);

  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const appendTraceMessage = React.useCallback((message: ChatMessage) => {
    const nextMessages = [...messagesRef.current, message];
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
  }, []);

  const normalizedHistoryItems = React.useMemo<SearchHistoryEntry[]>(
    () =>
      (historyItems ?? []).map((historyItem) => ({
        ...historyItem,
        recommendations: historyItem.recommendations.map((recommendation) => ({
          ...recommendation,
          prTimelineMonths: toNumberPair(recommendation.prTimelineMonths),
          citizenshipTimelineYears: recommendation.citizenshipTimelineYears
            ? toNumberPair(recommendation.citizenshipTimelineYears)
            : null,
        })),
      })),
    [historyItems],
  );

  const handleAgentEvent = React.useCallback(
    (event: AgentUiEvent) => {
      switch (event.type) {
        case "profile_extracted":
          setProfile(event.profile);
          setProgressMessage(
            "Profile understood. Building country shortlist...",
          );
          appendTraceMessage({
            role: "agent",
            content: "Extracted applicant profile and goals from the prompt.",
          });
          break;
        case "progress":
          setProgressMessage(event.message);
          appendTraceMessage({
            role: "tool",
            content: event.message,
          });
          break;
        case "country_recommended":
          const recommendation = normalizeRecommendation(event.recommendation);
          setRecommendations((current) => {
            const next = upsertRecommendation(current, recommendation);
            recommendationsRef.current = next;
            setSelectedCountryId((selected) => selected ?? recommendation.id);
            return next;
          });
          setProgressMessage(
            `Added ${recommendation.country.name} to the map.`,
          );
          appendTraceMessage({
            role: "tool",
            content: `Recommended ${recommendation.country.name}: ${recommendation.bestPathway} (${recommendation.score}% fit).`,
          });
          break;
        case "research_complete": {
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: event.summary,
          };
          const nextMessages = [...messagesRef.current, assistantMessage];
          messagesRef.current = nextMessages;
          setStatus("complete");
          setSummary(event.summary);
          setProgressMessage(event.summary);
          setMessages(nextMessages);

          const prompt = currentPromptRef.current;
          if (prompt && recommendationsRef.current.length > 0) {
            void saveHistory({
              prompt,
              messages: nextMessages,
              recommendations: recommendationsRef.current.map(
                normalizeRecommendation,
              ),
              summary: event.summary,
            }).catch((saveError) => {
              console.warn("Failed to save search history", saveError);
            });
          }
          break;
        }
        case "research_error":
          setStatus("error");
          setError(event.message);
          setProgressMessage(null);
          appendTraceMessage({
            role: "assistant",
            content: `Research failed: ${event.message}`,
          });
          break;
      }
    },
    [appendTraceMessage, saveHistory],
  );

  const handleSelectHistory = React.useCallback((entry: SearchHistoryEntry) => {
    abortRef.current?.abort();
    const restoredRecommendations = entry.recommendations;
    currentPromptRef.current = entry.prompt;
    recommendationsRef.current = restoredRecommendations;
    messagesRef.current = entry.messages;

    setMessages(entry.messages);
    setProfile(null);
    setRecommendations(restoredRecommendations);
    setSelectedCountryId(restoredRecommendations[0]?.id ?? null);
    setSummary(entry.summary);
    setError(null);
    setStatus("complete");
    setProgressMessage(
      `Restored ${restoredRecommendations.length} destinations from history.`,
    );
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

      currentPromptRef.current = prompt;
      messagesRef.current = nextMessages;
      recommendationsRef.current = [];
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
        historyItems={normalizedHistoryItems}
        messages={messages}
        onSelectCountry={setSelectedCountryId}
        onSelectHistory={handleSelectHistory}
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
            <PromptBox
              disabled={status === "researching"}
              onSend={handleSend}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
