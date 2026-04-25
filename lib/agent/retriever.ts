export type RetrievedSource = {
  title: string;
  url: string;
  publisher: string;
  snippet: string;
};

type ExaResult = {
  title?: string;
  url?: string;
  text?: string;
  summary?: string;
};

function officialPublisher(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname;
  } catch {
    return "Official source";
  }
}

function fallbackSources(countryName: string, officialImmigrationUrl: string) {
  return [
    {
      title: `${countryName} official immigration portal`,
      url: officialImmigrationUrl,
      publisher: officialPublisher(officialImmigrationUrl),
      snippet:
        "Fallback official source. Configure EXA_API_KEY for broader official-source retrieval.",
    },
  ];
}

export async function retrieveOfficialSources({
  countryName,
  officialImmigrationUrl,
  pathwayFocus,
}: {
  countryName: string;
  officialImmigrationUrl: string;
  pathwayFocus?: string;
}): Promise<RetrievedSource[]> {
  const exaApiKey = process.env.EXA_API_KEY;
  if (!exaApiKey) {
    return fallbackSources(countryName, officialImmigrationUrl);
  }

  const query = [
    officialPublisher(officialImmigrationUrl),
    countryName,
    pathwayFocus ?? "permanent residence skilled worker study visa requirements",
    "official immigration",
  ].join(" ");

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": exaApiKey,
    },
    body: JSON.stringify({
      query,
      numResults: 5,
      type: "keyword",
      includeDomains: [officialPublisher(officialImmigrationUrl)],
      contents: {
        text: { maxCharacters: 1800 },
        summary: true,
      },
    }),
  });

  if (!response.ok) {
    return fallbackSources(countryName, officialImmigrationUrl);
  }

  const payload = (await response.json()) as { results?: ExaResult[] };
  const sources =
    payload.results
      ?.filter((result): result is ExaResult & { url: string } =>
        Boolean(result.url),
      )
      .map((result) => ({
        title: result.title ?? officialPublisher(result.url),
        url: result.url,
        publisher: officialPublisher(result.url),
        snippet: result.summary ?? result.text ?? "",
      })) ?? [];

  return sources.length > 0
    ? sources
    : fallbackSources(countryName, officialImmigrationUrl);
}
