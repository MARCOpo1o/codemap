import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STACK_LABELS } from "@/core/stackLabels";
import type { ProjectMap } from "@/core/types";

export function OverviewPanel({ map }: { map: ProjectMap }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{map.spec.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm">{map.summary}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{map.templateLabel}</Badge>
            <Badge variant="secondary">{map.spec.teamMode === "team" ? "Team project" : "Solo project"}</Badge>
            <Badge variant="secondary">{STACK_LABELS[map.spec.stack]}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {map.milestones.map((milestone) => (
            <div key={milestone.id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{milestone.name}</p>
              <p className="text-sm text-muted-foreground">{milestone.goal}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {milestone.issueTitles.length} issue{milestone.issueTitles.length === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
