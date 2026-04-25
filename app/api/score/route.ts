import { NextResponse } from "next/server";
import { destinationCountries, immigrationPathways } from "@/app/(home)/data";
import { scoreDestinations } from "@/lib/scoring";
import type { ImmigrationProfile } from "@/lib/types";

export async function POST(request: Request) {
  const profile = (await request.json()) as ImmigrationProfile;
  const scores = scoreDestinations(
    profile,
    destinationCountries,
    immigrationPathways,
  );

  return NextResponse.json({ scores });
}
