// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const REST_COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,subregion,capital,flags,latlng";

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
  };
  /** [latitude, longitude] from REST Countries */
  latlng?: number[];
};

type SearchResult = {
  name: string | null;
  officialName: string | null;
  iso2: string | null;
  iso3: string | null;
  capital: string | null;
  region: string | null;
  subregion: string | null;
  flag: string | null;
  latitude: number | null;
  longitude: number | null;
};

export const revalidate = 60 * 60 * 24;

function scoreCountry(country: RawCountry, q: string) {
  const name = country.name?.common?.toLowerCase() ?? "";
  const official = country.name?.official?.toLowerCase() ?? "";
  const capital = country.capital?.[0]?.toLowerCase() ?? "";
  const iso2 = country.cca2?.toLowerCase() ?? "";
  const iso3 = country.cca3?.toLowerCase() ?? "";

  const haystacks = [name, official, capital, iso2, iso3];

  if (haystacks.some((value) => value === q)) return 100;
  if (haystacks.some((value) => value.startsWith(q))) return 60;
  if (haystacks.some((value) => value.includes(q))) return 20;
  return 0;
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "12");

    if (!q) {
      return NextResponse.json({ results: [] });
    }

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

    const results: SearchResult[] = countries
      .map((country) => ({
        country,
        score: scoreCountry(country, q),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(Math.max(limit, 1), 20))
      .map(({ country }) => {
        const latlng = country.latlng;
        const lat = latlng?.[0];
        const lng = latlng?.[1];
        return {
          name: country.name?.common ?? null,
          officialName: country.name?.official ?? null,
          iso2: country.cca2 ?? null,
          iso3: country.cca3 ?? null,
          capital: country.capital?.[0] ?? null,
          region: country.region ?? null,
          subregion: country.subregion ?? null,
          flag: country.flags?.svg ?? null,
          latitude:
            typeof lat === "number" && Number.isFinite(lat) ? lat : null,
          longitude:
            typeof lng === "number" && Number.isFinite(lng) ? lng : null,
        };
      });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
