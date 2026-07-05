"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { copyToClipboard, downloadTextFile } from "@/lib/clipboard";
import { readmeToMarkdown } from "@/core/markdown";
import type { ReadmeSpec } from "@/core/types";

export function ReadmePreview({ readme }: { readme: ReadmeSpec }) {
  const [copied, setCopied] = useState(false);
  const markdown = readmeToMarkdown(readme);

  async function handleCopy() {
    const ok = await copyToClipboard(markdown);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? "Copied" : "Copy markdown"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadTextFile("README.md", markdown)}
        >
          Download README.md
        </Button>
      </div>
      <Card>
        <CardContent>
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{markdown}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
