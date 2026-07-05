"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copyToClipboard } from "@/lib/clipboard";
import { issueToMarkdown, issuesToMarkdown } from "@/core/markdown";
import type { GithubIssueSpec, Milestone } from "@/core/types";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      {copied ? "Copied" : label}
    </Button>
  );
}

export function IssueList({
  issues,
  milestones,
}: {
  issues: GithubIssueSpec[];
  milestones: Milestone[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CopyButton text={issuesToMarkdown(issues, milestones)} label="Copy all issues as markdown" />
      </div>

      {milestones.map((milestone) => {
        const milestoneIssues = issues.filter((issue) => issue.milestone === milestone.name);
        if (milestoneIssues.length === 0) return null;

        return (
          <div key={milestone.id} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">{milestone.name}</h3>
            {milestoneIssues.map((issue) => (
              <Card key={issue.id}>
                <CardHeader className="flex-row items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5">
                    <CardTitle>{issue.title}</CardTitle>
                    <div className="flex flex-wrap gap-1.5">
                      {issue.labels.map((label) => (
                        <Badge key={label} variant="secondary">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CopyButton text={issueToMarkdown(issue)} label="Copy" />
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                    {issue.body}
                  </pre>
                  {issue.dependsOn.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Depends on: {issue.dependsOn.join(", ")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
}
