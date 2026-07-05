import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TaskArea } from "@/core/types";

export function TaskSplitPanel({ taskSplit }: { taskSplit: TaskArea[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        A starting point for dividing the work — adjust it based on who's on the team.
      </p>
      {taskSplit.map((area) => (
        <Card key={area.name}>
          <CardHeader>
            <CardTitle>{area.name}</CardTitle>
            <CardDescription>{area.focus}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {area.screenNames.length > 0 && (
              <p>
                <span className="text-muted-foreground">Screens: </span>
                {area.screenNames.join(", ")}
              </p>
            )}
            {area.issueTitles.length > 0 && (
              <p>
                <span className="text-muted-foreground">Issues: </span>
                {area.issueTitles.join(", ")}
              </p>
            )}
            {area.sharedTouchpoints.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Shared with other tracks: {area.sharedTouchpoints.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
