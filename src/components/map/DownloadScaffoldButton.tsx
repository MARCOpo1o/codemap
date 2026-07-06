"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateScaffold } from "@/core/generateScaffold";
import { toKebabCase } from "@/core/naming";
import type { ProjectMap } from "@/core/types";
import { downloadScaffoldZip } from "@/lib/zip";

export function DownloadScaffoldButton({ map }: { map: ProjectMap }) {
  const [status, setStatus] = useState<"idle" | "preparing" | "done">("idle");

  async function handleClick() {
    setStatus("preparing");
    const files = generateScaffold(map);
    await downloadScaffoldZip(toKebabCase(map.spec.name), files);
    setStatus("done");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <Button onClick={handleClick} disabled={status === "preparing"}>
      {status === "preparing" ? "Preparing..." : status === "done" ? "Downloaded" : "Download starter project"}
    </Button>
  );
}
