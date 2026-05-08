import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ImmigrationPathway } from "@/lib/types";

function formatTimeline(months: [number, number]) {
  const [min, max] = months;
  return `${Math.round(min / 12)}-${Math.round(max / 12)} years`;
}

export function PathwayCard({ pathway }: { pathway: ImmigrationPathway }) {
  return (
    <Card size="sm" className="bg-background/80">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{pathway.name}</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              {pathway.summary}
            </p>
          </div>
          <Badge variant="outline">
            {pathway.category.replaceAll("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">PR timeline</p>
            <p className="font-medium">
              {formatTimeline(pathway.prTimelineMonths)}
            </p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="text-muted-foreground">Funds estimate</p>
            <p className="font-medium">
              ${pathway.minSavingsUsd.toLocaleString()}+
            </p>
          </div>
        </div>
        <div>
          <p className="mb-1 font-medium">Documents to prepare</p>
          <div className="flex flex-wrap gap-1">
            {pathway.documents.slice(0, 5).map((document) => (
              <Badge key={document} variant="secondary">
                {document}
              </Badge>
            ))}
          </div>
        </div>
        <a
          href={pathway.sourceLinks[0]?.url}
          target="_blank"
          rel="noreferrer"
          className="text-primary inline-flex text-xs font-medium hover:underline"
        >
          Official source: {pathway.sourceLinks[0]?.publisher}
        </a>
      </CardContent>
    </Card>
  );
}
