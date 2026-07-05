"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectMapView } from "@/components/map/ProjectMapView";
import { ProjectWizard } from "@/components/wizard/ProjectWizard";
import { Button } from "@/components/ui/button";
import { buildCustomTemplate } from "@/core/blocks";
import { generateProjectMap } from "@/core/generateProjectMap";
import { CUSTOM_TEMPLATE_ID } from "@/core/types";
import type { ProjectSpec, ProjectTemplate } from "@/core/types";
import { clearLastSpec, loadLastSpec, saveLastSpec } from "@/lib/persistence";
import { getTemplate, templates } from "@/templates";

/** Resolve a spec's ProjectTemplate — from the registry for a preset, or built on the fly for a custom (things + blocks) project. */
function resolveTemplate(spec: ProjectSpec): ProjectTemplate | undefined {
  if (spec.templateId === CUSTOM_TEMPLATE_ID) {
    return spec.things && spec.things.length > 0 ? buildCustomTemplate(spec.things) : undefined;
  }
  return getTemplate(spec.templateId);
}

export default function BuilderPage() {
  return (
    <Suspense fallback={null}>
      <BuilderContent />
    </Suspense>
  );
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const initialTemplateId = searchParams.get("template") ?? undefined;
  const initialMode = searchParams.get("mode") === "custom" ? "custom" : undefined;
  const [spec, setSpec] = useState<ProjectSpec | null>(null);
  const [restoredSpec, setRestoredSpec] = useState<ProjectSpec | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadLastSpec();
    if (saved && resolveTemplate(saved)) {
      setSpec(saved);
      setRestoredSpec(saved);
    }
    setHydrated(true);
  }, []);

  const template = spec ? resolveTemplate(spec) : undefined;
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
        <ProjectWizard
          templates={templates}
          initialSpec={restoredSpec}
          initialTemplateId={initialTemplateId}
          initialMode={initialMode}
          onGenerate={handleGenerate}
        />
      )}
    </main>
  );
}
