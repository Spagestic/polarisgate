import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  CountryScore,
  DestinationCountry,
  ImmigrationPathway,
} from "@/lib/types";
import { PathwayCard } from "./pathway-card";

export function CountryPanel({
  country,
  score,
  pathways,
}: {
  country: DestinationCountry;
  score: CountryScore | undefined;
  pathways: ImmigrationPathway[];
}) {
  const bestPathway = pathways.find(
    (pathway) => pathway.id === score?.bestPathwayId,
  );
  const visiblePathways = bestPathway
    ? [
        bestPathway,
        ...pathways.filter((pathway) => pathway.id !== bestPathway.id),
      ]
    : pathways;

  return (
    <div className="absolute top-4 right-4 z-20 hidden w-95 max-w-[calc(100%-2rem)] space-y-3 lg:block">
      <Card className="bg-background/85 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs">{country.region}</p>
              <CardTitle className="text-xl">{country.name}</CardTitle>
            </div>
            <Badge>{score?.score ?? 0}/100</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium">{score?.summary}</span>
              <span className="text-muted-foreground">Fit score</span>
            </div>
            <Progress value={score?.score ?? 0} />
          </div>
          <div className="space-y-2 text-xs">
            {score?.reasons.map((reason) => (
              <p key={reason} className="rounded-lg bg-muted/60 px-2.5 py-2">
                {reason}
              </p>
            ))}
            {score?.cautions.map((caution) => (
              <p
                key={caution}
                className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-amber-700 dark:text-amber-300"
              >
                {caution}
              </p>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a
                href={country.officialImmigrationUrl}
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            Open official immigration site
          </Button>
        </CardContent>
      </Card>
      <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
        {visiblePathways.map((pathway) => (
          <PathwayCard key={pathway.id} pathway={pathway} />
        ))}
      </div>
    </div>
  );
}
