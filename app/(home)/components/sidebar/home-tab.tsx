"use client";

import { Loader2Icon } from "lucide-react";

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

function AgentTracePanel({ messages }: { messages: ChatMessage[] }) {
  return (
    <section className="">
      {messages.length === 0 ? (
        <p className="text-muted-foreground text-sm leading-6">
          Agent activity will appear here once you start a migration search.
        </p>
      ) : (
        <div className="space-y-2">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
              className="bg-muted/60 rounded-lg p-2"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                  {messageLabel(message.role)}
                </span>
              </div>
              <p className="text-sm leading-5">{message.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function HomeTab({
  researchStatus,
  progressMessage,
  profile,
  summary,
  error,
  messages,
}: HomeTabProps) {
  return (
    <div className="space-y-4 p-4">
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

      <AgentTracePanel messages={messages} />
    </div>
  );
}
