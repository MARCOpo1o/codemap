"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectMapView } from "@/components/map/ProjectMapView";
import { ProjectWizard } from "@/components/wizard/ProjectWizard";
import { Button } from "@/components/ui/button";
import { generateProjectMap } from "@/core/generateProjectMap";
import type { ProjectSpec } from "@/core/types";
import { clearLastSpec, loadLastSpec, saveLastSpec } from "@/lib/persistence";
import { getTemplate, templates } from "@/templates";

export default function BuilderPage() {
  const [spec, setSpec] = useState<ProjectSpec | null>(null);
  const [restoredSpec, setRestoredSpec] = useState<ProjectSpec | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadLastSpec();
    if (saved && getTemplate(saved.templateId)) {
      setSpec(saved);
      setRestoredSpec(saved);
    }
    setHydrated(true);
  }, []);

  const template = spec ? getTemplate(spec.templateId) : undefined;
  const map = useMemo(() => {
    if (!spec || !template) return null;
    return generateProjectMap(spec, template);
  }, [spec, template]);

  function handleGenerate(nextSpec: ProjectSpec) {
    saveLastSpec(nextSpec);
    setSpec(nextSpec);
  }

  function handleStartOver() {
    clearLastSpec();
    setSpec(null);
    setRestoredSpec(null);
  }

  if (!hydrated) return null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      {map ? (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium">Your project map</h1>
            <Button variant="outline" size="sm" onClick={handleStartOver}>
              Start over
            </Button>
          </div>
          <ProjectMapView map={map} />
        </>
      ) : (
        <ProjectWizard templates={templates} initialSpec={restoredSpec} onGenerate={handleGenerate} />
      )}
    </main>
  );
}
