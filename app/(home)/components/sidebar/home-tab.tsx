"use client";

import { Loader2Icon } from "lucide-react";

import {
  Tool,
  ToolContent,
  ToolHeader,
  type ToolPart,
} from "@/components/tool";
import type {
  ApplicantProfile,
  ChatMessage,
  ResearchStatus,
} from "@/lib/immigration/types";

type HomeTabProps = {
  researchStatus: ResearchStatus;
  progressMessage?: string | null;
  profile?: ApplicantProfile | null;
  summary?: string | null;
  error?: string | null;
  messages: ChatMessage[];
};

function formatCurrency(value: number | null) {
  if (typeof value !== "number") return "Varies";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function messageLabel(role: ChatMessage["role"]) {
  if (role === "user") return "You";
  if (role === "assistant") return "Answer";
  if (role === "tool") return "Tool";
  return "Agent";
}

function toolTitle(content: string) {
  if (content.startsWith("Recommended ")) return "Recommendation";
  if (content.includes("enriching immigration and economic data")) {
    return "Enriching data";
  }
  if (content.includes("searching the web")) return "Web research";
  return "Tool call";
}

function countryFromTrace(content: string) {
  return (
    content.match(/selected ([^;]+);/)?.[1] ??
    content.match(/^Recommended ([^:]+):/)?.[1] ??
    null
  );
}

function latestUserPrompt(messages: ChatMessage[], index: number) {
  return messages
    .slice(0, index)
    .reverse()
    .find((message) => message.role === "user")?.content;
}

function toolQuery(
  message: ChatMessage,
  messages: ChatMessage[],
  index: number,
) {
  const country = countryFromTrace(message.content);
  const prompt = latestUserPrompt(messages, index);

  if (message.content.includes("searching the web")) {
    return prompt
      ? `Find destination countries for: ${prompt}`
      : "Find destination countries that match the applicant profile.";
  }

  if (message.content.includes("enriching immigration and economic data")) {
    return country
      ? `Research official immigration and economic data for ${country}.`
      : "Research official immigration and economic data for the selected destination.";
  }

  if (message.content.startsWith("Recommended ")) {
    return country
      ? `Build a ranked immigration recommendation for ${country}.`
      : "Build a ranked immigration recommendation from the research result.";
  }

  return prompt
    ? `Run immigration research for: ${prompt}`
    : "Run immigration research.";
}

function ToolTraceMessage({
  index,
  isRunning,
  message,
  messages,
}: {
  index: number;
  isRunning: boolean;
  message: ChatMessage;
  messages: ChatMessage[];
}) {
  const state = (
    isRunning ? "input-available" : "output-available"
  ) satisfies ToolPart["state"];

  return (
    <Tool
      className="mb-0 min-w-0 max-w-full overflow-hidden bg-muted/60 my-1"
      defaultOpen={isRunning}
    >
      <ToolHeader
        className="min-w-0"
        state={state}
        title={toolTitle(message.content)}
        toolName="immigration-research"
        type="dynamic-tool"
      />
      <ToolContent className="min-w-0 p-3">
        <TraceSection label="Query">
          {toolQuery(message, messages, index)}
        </TraceSection>
        <TraceSection label="Result">{message.content}</TraceSection>
      </ToolContent>
    </Tool>
  );
}

function TraceSection({
  children,
  label,
}: {
  children: string;
  label: string;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </h4>
      <p className="wrap-break-word rounded-md bg-muted/50 p-3 text-sm leading-5">
        {children}
      </p>
    </div>
  );
}

function AgentTracePanel({
  messages,
  researchStatus,
}: {
  messages: ChatMessage[];
  researchStatus: ResearchStatus;
}) {
  return (
    <section className="min-w-0">
      {messages.length === 0 ? (
        <p className="text-muted-foreground text-sm leading-6">
          Agent activity will appear here once you start a migration search.
        </p>
      ) : (
        <div className="min-w-0 space-y-2">
          {messages.map((message, index) => {
            const key = `${message.role}-${index}-${message.content.slice(0, 16)}`;
            const isRunningTool =
              researchStatus === "researching" &&
              message.role === "tool" &&
              index === messages.length - 1;

            if (message.role === "tool") {
              return (
                <ToolTraceMessage
                  index={index}
                  isRunning={isRunningTool}
                  key={`${key}-${isRunningTool ? "running" : "done"}`}
                  message={message}
                  messages={messages}
                />
              );
            }

            return (
              <div key={key} className="min-w-0 rounded-lg bg-muted/60 p-2">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                    {messageLabel(message.role)}
                  </span>
                </div>
                <p className="wrap-break-word text-sm leading-5">
                  {message.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function HomeTab({
  researchStatus,
  progressMessage,
  profile,
  error,
  messages,
}: HomeTabProps) {
  return (
    <div className="min-w-0 space-y-4 p-4">
      {researchStatus === "researching" ? (
        <div className="bg-muted/40 rounded-xl border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2Icon className="size-4 animate-spin" />
            Agent researching
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {progressMessage ??
              "Finding official sources and ranking routes..."}
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border p-3 text-sm">
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

      <AgentTracePanel messages={messages} researchStatus={researchStatus} />
    </div>
  );
}
