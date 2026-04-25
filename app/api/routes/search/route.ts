import { NextResponse } from "next/server";
import { destinationCountries } from "@/app/(home)/data";
import { researchCountryPathway } from "@/lib/agent/research";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    countryId?: string;
    pathwayFocus?: string;
  };

  const country = destinationCountries.find(
    (destination) => destination.id === body.countryId,
  );

  if (!country) {
    return NextResponse.json(
      { error: "Unknown destination country" },
      { status: 400 },
    );
  }

  const pathway = await researchCountryPathway({
    country,
    pathwayFocus: body.pathwayFocus,
  });

  return NextResponse.json({
    countryId: country.id,
    pathway,
    disclaimer:
      "This is AI-assisted research, not legal advice. Verify details with official government sources.",
  });
}
