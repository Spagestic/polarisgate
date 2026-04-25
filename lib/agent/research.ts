import type { DestinationCountry, ImmigrationPathway } from "../types";
import { extractPathwayDraft } from "./extractor";
import { retrieveOfficialSources } from "./retriever";

export async function researchCountryPathway({
  country,
  pathwayFocus,
}: {
  country: Pick<
    DestinationCountry,
    "id" | "name" | "officialImmigrationUrl"
  >;
  pathwayFocus?: string;
}): Promise<ImmigrationPathway> {
  const sources = await retrieveOfficialSources({
    countryName: country.name,
    officialImmigrationUrl: country.officialImmigrationUrl,
    pathwayFocus,
  });

  return await extractPathwayDraft({
    countryId: country.id,
    countryName: country.name,
    sources,
    pathwayFocus,
  });
}
