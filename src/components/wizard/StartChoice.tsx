"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectTemplate } from "@/core/types";

export function StartChoice({
  templates,
  onChoosePreset,
  onChooseScratch,
}: {
  templates: ProjectTemplate[];
  onChoosePreset: (templateId: string) => void;
  onChooseScratch: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Start from an example, or describe your own idea from scratch — either way you'll end up
        with a full project map.
      </p>

      <button type="button" className="text-left" onClick={onChooseScratch}>
        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Start from scratch</CardTitle>
            <CardDescription>
              Describe your own idea — name the things it's built around and pick what people can
              do with each one.
            </CardDescription>
          </CardHeader>
        </Card>
      </button>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Or start from an example</p>
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className="text-left"
            onClick={() => onChoosePreset(template.id)}
          >
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">{template.label}</CardTitle>
                <CardDescription>{template.shortDescription}</CardDescription>
              </CardHeader>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
