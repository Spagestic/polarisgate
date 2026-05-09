/* eslint-disable @next/next/no-img-element */
// components/search-bar.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LoaderCircleIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchResult = {
  name: string | null;
  officialName: string | null;
  iso2: string | null;
  iso3: string | null;
  capital: string | null;
  region: string | null;
  subregion: string | null;
  flag: string | null;
  /** WGS84 latitude; used to fly the map when present */
  latitude?: number | null;
  /** WGS84 longitude */
  longitude?: number | null;
};

type SearchbarProps = {
  placeholder?: string;
  initialCountries?: SearchResult[];
  debounceMs?: number;
  minQueryLength?: number;
  onSelect?: (country: SearchResult) => void;
  getCountryHref?: (country: SearchResult) => string;
  className?: string;
};

const DEFAULT_INITIAL_COUNTRIES: SearchResult[] = [
  {
    name: "Canada",
    officialName: "Canada",
    iso2: "CA",
    iso3: "CAN",
    capital: "Ottawa",
    region: "Americas",
    subregion: "North America",
    flag: "https://flagcdn.com/ca.svg",
    latitude: 56.1304,
    longitude: -106.3468,
  },
  {
    name: "Australia",
    officialName: "Commonwealth of Australia",
    iso2: "AU",
    iso3: "AUS",
    capital: "Canberra",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    flag: "https://flagcdn.com/au.svg",
    latitude: -25.2744,
    longitude: 133.7751,
  },
  {
    name: "United Kingdom",
    officialName: "United Kingdom of Great Britain and Northern Ireland",
    iso2: "GB",
    iso3: "GBR",
    capital: "London",
    region: "Europe",
    subregion: "Northern Europe",
    flag: "https://flagcdn.com/gb.svg",
    latitude: 55.3781,
    longitude: -3.436,
  },
  {
    name: "Germany",
    officialName: "Federal Republic of Germany",
    iso2: "DE",
    iso3: "DEU",
    capital: "Berlin",
    region: "Europe",
    subregion: "Western Europe",
    flag: "https://flagcdn.com/de.svg",
    latitude: 51.1657,
    longitude: 10.4515,
  },
  {
    name: "Singapore",
    officialName: "Republic of Singapore",
    iso2: "SG",
    iso3: "SGP",
    capital: "Singapore",
    region: "Asia",
    subregion: "South-Eastern Asia",
    flag: "https://flagcdn.com/sg.svg",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    name: "Japan",
    officialName: "Japan",
    iso2: "JP",
    iso3: "JPN",
    capital: "Tokyo",
    region: "Asia",
    subregion: "Eastern Asia",
    flag: "https://flagcdn.com/jp.svg",
    latitude: 36.2048,
    longitude: 138.2529,
  },
];

export function Searchbar({
  placeholder = "Search destination country...",
  initialCountries = DEFAULT_INITIAL_COUNTRIES,
  debounceMs = 250,
  minQueryLength = 1,
  onSelect,
  getCountryHref = (country) => {
    const code = country.iso3 || country.iso2;
    return code ? `/?country=${code.toLowerCase()}` : "/";
  },
  className,
}: SearchbarProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [items, setItems] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const query = value.trim();
  const shouldSearch = query.length >= minQueryLength;

  React.useEffect(() => {
    if (!shouldSearch) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      void (async () => {
        try {
          const params = new URLSearchParams({ q: query });
          const response = await fetch(`/api/search?${params}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;

            throw new Error(payload?.error || "Failed to search destinations.");
          }

          const { results } = (await response.json()) as {
            results: SearchResult[];
          };

          setItems(results);
        } catch (fetchError) {
          if (controller.signal.aborted) return;

          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to search destinations.",
          );
          setItems([]);
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      })();
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [debounceMs, query, shouldSearch]);

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  const handleSelect = React.useCallback(
    (country: SearchResult) => {
      onSelect?.(country);

      const href = getCountryHref(country);
      setOpen(false);
      setValue("");
      setItems([]);
      setError(null);

      if (href) {
        router.push(href);
      }
    },
    [getCountryHref, onSelect, router],
  );

  const handleQueryChange = React.useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      if (nextValue.trim().length < minQueryLength) {
        setItems([]);
        setLoading(false);
        setError(null);
      }
      setOpen(true);
    },
    [minQueryLength],
  );

  const handleQueryFocus = React.useCallback(() => {
    setOpen(true);
  }, []);

  const handleClear = React.useCallback(() => {
    setValue("");
    setItems([]);
    setError(null);
    setLoading(false);
    setOpen(true);
    inputRef.current?.focus();
  }, []);

  const showInitialCountries = !query;
  const showEmptyResults =
    shouldSearch && !loading && !error && items.length === 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        nativeButton={false}
        onClick={(e) => {
          if (open) {
            e.preventDefault();
          }
        }}
        render={
          <InputGroup
            className={cn("w-full max-w-xl bg-background shadow-sm", className)}
            onClick={(e) => {
              if (open) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <InputGroupInput
              ref={inputRef}
              value={value}
              onChange={(event) => handleQueryChange(event.target.value)}
              onFocus={handleQueryFocus}
              onClick={(e) => {
                if (open) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              placeholder={placeholder}
              aria-label="Search countries"
              autoComplete="off"
              spellCheck={false}
            />

            <InputGroupAddon
              align="inline-start"
              className="pointer-events-none"
            >
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>

            <InputGroupAddon align="inline-end">
              {loading ? (
                <Spinner className="size-4" />
              ) : query ? (
                <div className="flex items-center gap-1">
                  {!error ? (
                    <span className="text-xs text-muted-foreground">
                      {items.length} result{items.length === 1 ? "" : "s"}
                    </span>
                  ) : null}

                  <InputGroupButton
                    aria-label="Clear search"
                    size="icon-xs"
                    variant="ghost"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleClear}
                  >
                    <XIcon />
                  </InputGroupButton>
                </div>
              ) : (
                <span className="px-2 text-[10px] font-medium tracking-wide text-muted-foreground">
                  ⌘K
                </span>
              )}
            </InputGroupAddon>
          </InputGroup>
        }
      />

      <PopoverContent
        align="start"
        sideOffset={10}
        initialFocus={inputRef}
        className="w-(--anchor-width) max-w-[calc(100vw-2rem)] p-0"
      >
        <div
          className="max-h-[70vh] overflow-y-auto p-2"
          aria-busy={loading || undefined}
        >
          {shouldSearch && loading ? (
            <div className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground">
              <LoaderCircleIcon className="size-4 animate-spin" />
              Searching…
            </div>
          ) : null}

          {shouldSearch && error ? (
            <div className="rounded-md px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {showInitialCountries ? (
            <div className="space-y-2">
              <div className="grid gap-1">
                {initialCountries.map((country, index) => {
                  const key =
                    country.iso3 ||
                    country.iso2 ||
                    country.name ||
                    String(index);

                  return (
                    <button
                      key={key}
                      type="button"
                      className="w-full rounded-md border border-border/60 bg-card p-3 text-left transition-colors hover:bg-muted/60"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(country)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg">
                          {country.flag ? (
                            <img
                              src={country.flag}
                              alt={`${country.name ?? "Country"} flag`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span>{"🌍"}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="font-medium text-sm">
                            {country.name || "Unknown"}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                            {country.region ? (
                              <span className="rounded-full bg-muted px-2 py-0.5 uppercase tracking-wide">
                                {country.region}
                              </span>
                            ) : null}

                            {country.capital ? (
                              <span>Capital: {country.capital}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {showEmptyResults ? (
            <div className="rounded-md px-3 py-3 text-sm text-muted-foreground">
              No matching destinations found.
            </div>
          ) : null}

          {shouldSearch && !loading && !error && items.length > 0 ? (
            <div className="grid gap-1">
              {items.map((country, index) => {
                const iconUrl = country.flag || null;

                return (
                  <button
                    key={
                      country.iso3 ||
                      country.iso2 ||
                      country.name ||
                      String(index)
                    }
                    type="button"
                    className="w-full rounded-md border border-border/60 bg-card p-3 text-left transition-colors hover:bg-muted/60"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(country)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={`${country.name ?? "Country"} flag`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{"🌍"}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-start justify-between gap-4">
                          <span className="line-clamp-2 text-md font-medium">
                            {country.name || "Unknown"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {country.region ? (
                            <span className="shrink-0 text-xs tracking-wide text-muted-foreground">
                              {country.region}
                            </span>
                          ) : null}

                          {country.capital ? (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {country.capital}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
