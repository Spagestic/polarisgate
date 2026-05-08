// app/api/countries/[code]/indicators/route.ts
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ code: string }> };

type RawWorldBankRow = {
  date?: string;
  value?: string | number | null;
  unit?: string | null;
  country?: {
    value?: string | null;
  };
  indicator?: {
    value?: string | null;
  };
};

type IndicatorRow = {
  year: string | undefined;
  value: string | number;
  unit: string | null;
  country: string | null;
  indicatorName: string | null;
};

type IndicatorResult = {
  indicator: string;
  data: IndicatorRow[];
};

export const revalidate = 60 * 60 * 24;

const DEFAULT_INDICATORS = [
  "NY.GDP.MKTP.CD", // GDP current US$
  "NY.GDP.MKTP.KD.ZG", // GDP growth annual %
  "FP.CPI.TOTL.ZG", // Inflation annual %
  "SP.POP.TOTL", // Population
];

async function fetchIndicator(
  code: string,
  indicator: string,
): Promise<IndicatorResult> {
  const url = `https://api.worldbank.org/v2/country/${code}/indicator/${indicator}?format=json&per_page=10`;

  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) return { indicator, data: [] };

  const json = await res.json();
  const rows: RawWorldBankRow[] = Array.isArray(json?.[1]) ? json[1] : [];

  return {
    indicator,
    data: rows
      .filter((row) => row.value !== null && row.value !== undefined)
      .map((row) => ({
        year: row.date,
        value: row.value,
        unit: row.unit ?? null,
        country: row.country?.value ?? null,
        indicatorName: row.indicator?.value ?? null,
      })),
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { code } = await params;
    const search = request.nextUrl.searchParams;
    const indicatorsParam = search.get("indicators");

    const indicators = indicatorsParam
      ? indicatorsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : DEFAULT_INDICATORS;

    const results = await Promise.all(
      indicators.map((indicator) =>
        fetchIndicator(code.toUpperCase(), indicator),
      ),
    );

    return NextResponse.json({
      countryCode: code.toUpperCase(),
      indicators: results,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
