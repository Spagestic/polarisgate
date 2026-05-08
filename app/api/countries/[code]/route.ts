// app/api/countries/[code]/route.ts
import { NextResponse } from "next/server";

type Params = { params: Promise<{ code: string }> };

export const revalidate = 60 * 60 * 24;

export async function GET(_: Request, { params }: Params) {
  try {
    const { code } = await params;
    const normalizedCode = code.toUpperCase();

    const restUrl = `https://restcountries.com/v3.1/alpha/${normalizedCode}`;
    const worldBankUrl = `https://api.worldbank.org/v2/country/${normalizedCode}?format=json`;

    const [restRes, wbRes] = await Promise.all([
      fetch(restUrl, { next: { revalidate: 60 * 60 * 24 } }),
      fetch(worldBankUrl, { next: { revalidate: 60 * 60 * 24 } }),
    ]);

    if (!restRes.ok) {
      return NextResponse.json({ error: "Country not found" }, { status: 404 });
    }

    const restJson = await restRes.json();
    const wbJson = wbRes.ok ? await wbRes.json() : null;

    const country = Array.isArray(restJson) ? restJson[0] : restJson;
    const wb = Array.isArray(wbJson?.[1]) ? wbJson[1][0] : null;

    return NextResponse.json({
      country: {
        name: country.name?.common ?? null,
        officialName: country.name?.official ?? null,
        iso2: country.cca2 ?? null,
        iso3: country.cca3 ?? null,
        capital: country.capital?.[0] ?? null,
        region: country.region ?? null,
        subregion: country.subregion ?? null,
        population: country.population ?? null,
        latlng: country.latlng ?? null,
        flags: country.flags ?? null,
        currencies: country.currencies ?? {},
        languages: country.languages ?? {},
        worldBank: wb
          ? {
              id: wb.id,
              name: wb.name,
              region: wb.region?.value ?? null,
              incomeLevel: wb.incomeLevel?.value ?? null,
              lendingType: wb.lendingType?.value ?? null,
              capitalCity: wb.capitalCity ?? null,
              longitude: wb.longitude ?? null,
              latitude: wb.latitude ?? null,
            }
          : null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
