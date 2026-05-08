// app/api/countries/route.ts
import { NextResponse } from "next/server";

export const revalidate = 60 * 60 * 24; // 24h

const REST_COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,capital,flags,latlng,population,currencies,languages";

type RawCountry = {
  name?: {
    common?: string;
    official?: string;
  };
  cca2?: string;
  cca3?: string;
  region?: string;
  subregion?: string;
  capital?: string[];
  flags?: {
    svg?: string;
    png?: string;
  };
  latlng?: number[];
  population?: number;
  currencies?: Record<string, unknown>;
  languages?: Record<string, unknown>;
};

type NormalizedCountry = {
  name: string | null;
  officialName: string | null;
  iso2: string | null;
  iso3: string | null;
  region: string | null;
  subregion: string | null;
  capital: string | null;
  flagSvg: string | null;
  flagPng: string | null;
  latlng: number[] | null;
  population: number | null;
  currencies: Record<string, unknown>;
  languages: Record<string, unknown>;
};

export async function GET() {
  try {
    const res = await fetch(REST_COUNTRIES_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch countries" },
        { status: 502 },
      );
    }

    const countries: RawCountry[] = await res.json();

    const normalized: NormalizedCountry[] = countries
      .map((country) => ({
        name: country.name?.common ?? null,
        officialName: country.name?.official ?? null,
        iso2: country.cca2 ?? null,
        iso3: country.cca3 ?? null,
        region: country.region ?? null,
        subregion: country.subregion ?? null,
        capital: country.capital?.[0] ?? null,
        flagSvg: country.flags?.svg ?? null,
        flagPng: country.flags?.png ?? null,
        latlng: country.latlng ?? null,
        population: country.population ?? null,
        currencies: country.currencies ?? {},
        languages: country.languages ?? {},
      }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

    return NextResponse.json({ countries: normalized });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
