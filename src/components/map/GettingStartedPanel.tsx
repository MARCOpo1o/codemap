import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GettingStartedSpec } from "@/core/types";

export function GettingStartedPanel({ gettingStarted }: { gettingStarted: GettingStartedSpec }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Never run a project like this before? Follow these steps in order — each one builds on
          the last.
        </p>
        <ol className="flex flex-col gap-3">
          {gettingStarted.steps.map((step, index) => (
            <li key={step.title} className="flex gap-3 rounded-lg border border-border p-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {index + 1}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{step.title}</span>
                <span className="text-sm text-muted-foreground">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Words used in this project map</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {gettingStarted.glossary.map((entry) => (
            <div key={entry.term}>
              <p className="text-sm font-medium">{entry.term}</p>
              <p className="text-sm text-muted-foreground">{entry.definition}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
