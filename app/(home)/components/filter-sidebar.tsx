"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavUser } from "./nav-user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { migrationGoalLabels, originCountries } from "../data";
import type {
  CountryScore,
  DestinationCountry,
  EducationLevel,
  ImmigrationProfile,
  LanguageLevel,
  MigrationGoal,
} from "@/lib/types";

const educationOptions: { value: EducationLevel; label: string }[] = [
  { value: "secondary", label: "Secondary school" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's" },
  { value: "masters", label: "Master's" },
  { value: "doctorate", label: "Doctorate" },
];

const languageOptions: { value: LanguageLevel; label: string }[] = [
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "native", label: "Native / fluent" },
];

const goalOptions = Object.entries(migrationGoalLabels) as [
  MigrationGoal,
  string,
][];

interface FilterSidebarProps {
  profile: ImmigrationProfile;
  countries: DestinationCountry[];
  scores: CountryScore[];
  selectedCountryId: string;
  onProfileChange: (profile: ImmigrationProfile) => void;
  onSelectCountry: (countryId: string) => void;
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="space-y-1.5 text-xs font-medium">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function rankedCountries(
  countries: DestinationCountry[],
  scores: CountryScore[],
) {
  const scoreByCountry = Object.fromEntries(
    scores.map((score) => [score.countryId, score]),
  );
  return countries
    .map((country) => ({
      country,
      score: scoreByCountry[country.id],
    }))
    .sort((a, b) => (b.score?.score ?? 0) - (a.score?.score ?? 0));
}

export function FilterSidebar({
  profile,
  countries,
  scores,
  selectedCountryId,
  onProfileChange,
  onSelectCountry,
}: FilterSidebarProps) {
  const ranked = rankedCountries(countries, scores);
  const topScore = scores[0];
  const selectedScore = scores.find(
    (score) => score.countryId === selectedCountryId,
  );

  const updateProfile = (patch: Partial<ImmigrationProfile>) => {
    onProfileChange({ ...profile, ...patch });
  };

  const toggleGoal = (goal: MigrationGoal) => {
    const nextGoals = profile.goals.includes(goal)
      ? profile.goals.filter((item) => item !== goal)
      : [...profile.goals, goal];
    updateProfile({ goals: nextGoals });
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-sm font-medium">Polaris Gate</span>
            <span className="text-muted-foreground text-xs">
              Immigration pathway explorer
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="bg-background rounded-md border px-2.5 py-2 text-center">
            <p className="text-lg leading-none font-bold tabular-nums">
              {countries.length}
            </p>
            <p className="text-muted-foreground mt-1 text-[10px]">Countries</p>
          </div>
          <div className="bg-background rounded-md border px-2.5 py-2 text-center">
            <p className="text-lg leading-none font-bold tabular-nums">
              {topScore?.score ?? 0}
            </p>
            <p className="text-muted-foreground mt-1 text-[10px]">Top fit</p>
          </div>
          <div className="bg-background rounded-md border px-2.5 py-2 text-center">
            <p className="text-lg leading-none font-bold tabular-nums">
              {selectedScore?.score ?? 0}
            </p>
            <p className="text-muted-foreground mt-1 text-[10px]">Selected</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your profile</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3 px-2">
            <SelectField
              label="Residence"
              value={profile.residenceCountry}
              options={originCountries.map((country) => ({
                value: country,
                label: country,
              }))}
              onChange={(residenceCountry) =>
                updateProfile({ residenceCountry })
              }
            />
            <SelectField
              label="Citizenship"
              value={profile.citizenshipCountry}
              options={originCountries.map((country) => ({
                value: country,
                label: country,
              }))}
              onChange={(citizenshipCountry) =>
                updateProfile({ citizenshipCountry })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1.5 text-xs font-medium">
                <span className="text-muted-foreground">Age</span>
                <Input
                  type="number"
                  min={16}
                  max={70}
                  value={profile.age}
                  onChange={(event) =>
                    updateProfile({ age: Number(event.target.value) })
                  }
                />
              </label>
              <label className="space-y-1.5 text-xs font-medium">
                <span className="text-muted-foreground">Savings USD</span>
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  value={profile.savingsUsd}
                  onChange={(event) =>
                    updateProfile({ savingsUsd: Number(event.target.value) })
                  }
                />
              </label>
            </div>
            <SelectField
              label="Education"
              value={profile.educationLevel}
              options={educationOptions}
              onChange={(educationLevel) => updateProfile({ educationLevel })}
            />
            <SelectField
              label="Language"
              value={profile.languageLevel}
              options={languageOptions}
              onChange={(languageLevel) => updateProfile({ languageLevel })}
            />
            <label className="space-y-1.5 text-xs font-medium">
              <span className="text-muted-foreground">Occupation</span>
              <Input
                value={profile.occupation}
                onChange={(event) =>
                  updateProfile({ occupation: event.target.value })
                }
                placeholder="e.g. software engineer"
              />
            </label>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Goals</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3 px-2">
            <div className="flex flex-wrap gap-1.5">
              {goalOptions.map(([goal, label]) => {
                const active = profile.goals.includes(goal);
                return (
                  <Button
                    key={goal}
                    type="button"
                    size="xs"
                    variant={active ? "default" : "outline"}
                    onClick={() => toggleGoal(goal)}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
            <Button
              type="button"
              size="sm"
              variant={profile.movingWithFamily ? "default" : "outline"}
              onClick={() =>
                updateProfile({ movingWithFamily: !profile.movingWithFamily })
              }
            >
              Moving with family
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Destination focus</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3 px-2">
            <label className="space-y-1.5 text-xs font-medium">
              <span className="text-muted-foreground">Target country</span>
              <select
                value={profile.targetCountryId ?? "all"}
                onChange={(event) => {
                  const value = event.target.value;
                  updateProfile({
                    targetCountryId: value === "all" ? null : value,
                  });
                  if (value !== "all") onSelectCountry(value);
                }}
                className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="all">Show best countries</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-2">
              {ranked.slice(0, 5).map(({ country, score }) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => onSelectCountry(country.id)}
                  className="hover:bg-muted/70 flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs transition-colors"
                  data-selected={country.id === selectedCountryId}
                >
                  <span>
                    <span className="block font-medium">{country.name}</span>
                    <span className="text-muted-foreground">
                      {score?.summary ?? "Needs research"}
                    </span>
                  </span>
                  <Badge
                    variant={
                      country.id === selectedCountryId ? "default" : "outline"
                    }
                  >
                    {score?.score ?? 0}
                  </Badge>
                </button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 pt-0">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
