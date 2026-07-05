"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StartChoice } from "@/components/wizard/StartChoice";
import { newThingDraft, ThingsEditor, type ThingDraft } from "@/components/wizard/ThingsEditor";
import { Textarea } from "@/components/ui/textarea";
import { buildCustomTemplate } from "@/core/blocks";
import { toKebabCase } from "@/core/naming";
import { CUSTOM_TEMPLATE_ID } from "@/core/types";
import type { ExperienceLevel, ProjectSpec, ProjectTemplate, TeamMode, ThingSpec } from "@/core/types";

interface ProjectWizardProps {
  templates: ProjectTemplate[];
  initialSpec?: ProjectSpec | null;
  initialTemplateId?: string;
  initialMode?: "preset" | "custom";
  onGenerate: (spec: ProjectSpec) => void;
}

type Mode = "start" | "preset" | "custom";

type Draft = {
  name: string;
  templateId: string;
  targetUser: string;
  problemStatement: string;
  selectedFeatureIds: string[];
  thingDrafts: ThingDraft[];
  experienceLevel: ExperienceLevel;
  teamMode: TeamMode;
};

function defaultCoreFeatureIds(template: ProjectTemplate | undefined): string[] {
  if (!template) return [];
  return template.features.filter((feature) => feature.core).map((feature) => feature.id);
}

function emptyDraft(): Draft {
  return {
    name: "",
    templateId: "",
    targetUser: "",
    problemStatement: "",
    selectedFeatureIds: [],
    thingDrafts: [newThingDraft("thing-1")],
    experienceLevel: "developing",
    teamMode: "solo",
  };
}

function thingDraftsFromSpec(spec: ProjectSpec): ThingDraft[] {
  if (!spec.things || spec.things.length === 0) return [newThingDraft("thing-1")];
  return spec.things.map((thing) => ({
    key: thing.id,
    name: thing.name,
    fields: thing.fields.map((field) => ({ name: field.name, type: field.type })),
    parentKey: thing.parentThingId,
    blockIds: thing.blockIds,
  }));
}

function initialModeFor(
  spec: ProjectSpec | null | undefined,
  templates: ProjectTemplate[],
  initialTemplateId?: string,
  initialCustom?: "preset" | "custom"
): Mode {
  if (spec) return spec.templateId === CUSTOM_TEMPLATE_ID ? "custom" : "preset";
  if (initialCustom) return initialCustom;
  if (initialTemplateId && templates.some((template) => template.id === initialTemplateId)) {
    return "preset";
  }
  return "start";
}

function draftFromSpec(
  spec: ProjectSpec | null | undefined,
  templates: ProjectTemplate[],
  initialTemplateId?: string
): Draft {
  if (spec) {
    return {
      name: spec.name,
      templateId: spec.templateId,
      targetUser: spec.targetUser,
      problemStatement: spec.problemStatement,
      selectedFeatureIds: spec.selectedFeatureIds,
      thingDrafts: thingDraftsFromSpec(spec),
      experienceLevel: spec.experienceLevel,
      teamMode: spec.teamMode,
    };
  }
  const preselected = templates.find((template) => template.id === initialTemplateId);
  const draft = emptyDraft();
  if (preselected) {
    draft.templateId = preselected.id;
    draft.selectedFeatureIds = defaultCoreFeatureIds(preselected);
  }
  return draft;
}

/** Turn ThingDrafts into ThingSpecs: derive a unique id from each name, drop blank fields, and resolve parent keys to parent ids. */
function buildThingsFromDrafts(thingDrafts: ThingDraft[]): ThingSpec[] {
  const usableDrafts = thingDrafts.filter((draft) => draft.name.trim().length > 0);
  const idByKey = new Map<string, string>();
  const usedIds = new Set<string>();

  for (const draft of usableDrafts) {
    const base = toKebabCase(draft.name);
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    idByKey.set(draft.key, id);
  }

  return usableDrafts.map((draft) => ({
    id: idByKey.get(draft.key)!,
    name: draft.name.trim(),
    fields: draft.fields
      .filter((field) => field.name.trim().length > 0)
      .map((field) => ({ name: field.name.trim(), type: field.type })),
    parentThingId: draft.parentKey ? idByKey.get(draft.parentKey) : undefined,
    blockIds: draft.blockIds,
  }));
}

function stepLabelsFor(mode: Mode): string[] {
  const middle = mode === "custom" ? "Things & Blocks" : "Features";
  return ["Start", "Basics", middle, "Context"];
}

export function ProjectWizard({
  templates,
  initialSpec,
  initialTemplateId,
  initialMode,
  onGenerate,
}: ProjectWizardProps) {
  const [mode, setMode] = useState<Mode>(() =>
    initialModeFor(initialSpec, templates, initialTemplateId, initialMode)
  );
  const [step, setStep] = useState(() => (mode === "start" ? 0 : 1));
  const [draft, setDraft] = useState<Draft>(() =>
    draftFromSpec(initialSpec, templates, initialTemplateId)
  );

  const stepLabels = stepLabelsFor(mode);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === draft.templateId),
    [templates, draft.templateId]
  );

  function updateDraft(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function choosePreset(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    setMode("preset");
    updateDraft({ templateId, selectedFeatureIds: defaultCoreFeatureIds(template) });
    setStep(1);
  }

  function chooseScratch() {
    setMode("custom");
    setStep(1);
  }

  function toggleFeature(featureId: string, checked: boolean) {
    setDraft((current) => ({
      ...current,
      selectedFeatureIds: checked
        ? [...current.selectedFeatureIds, featureId]
        : current.selectedFeatureIds.filter((id) => id !== featureId),
    }));
  }

  const basicsComplete =
    draft.name.trim().length > 0 &&
    draft.targetUser.trim().length > 0 &&
    draft.problemStatement.trim().length > 0;
  const featuresComplete = draft.selectedFeatureIds.length > 0;
  const thingsComplete = draft.thingDrafts.some(
    (thing) => thing.name.trim().length > 0 && thing.blockIds.length > 0
  );
  const middleStepComplete = mode === "custom" ? thingsComplete : featuresComplete;

  function handleSubmit() {
    if (mode === "preset") {
      if (!selectedTemplate) return;
      const spec: ProjectSpec = {
        name: draft.name.trim(),
        templateId: draft.templateId,
        targetUser: draft.targetUser.trim(),
        problemStatement: draft.problemStatement.trim(),
        experienceLevel: draft.experienceLevel,
        selectedFeatureIds: draft.selectedFeatureIds,
        teamMode: draft.teamMode,
        stack: "nextjs-web",
      };
      onGenerate(spec);
      return;
    }

    const things = buildThingsFromDrafts(draft.thingDrafts);
    const customTemplate = buildCustomTemplate(things);
    const spec: ProjectSpec = {
      name: draft.name.trim(),
      templateId: CUSTOM_TEMPLATE_ID,
      targetUser: draft.targetUser.trim(),
      problemStatement: draft.problemStatement.trim(),
      experienceLevel: draft.experienceLevel,
      selectedFeatureIds: customTemplate.features.map((feature) => feature.id),
      teamMode: draft.teamMode,
      stack: "nextjs-web",
      things,
    };
    onGenerate(spec);
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          Step {step + 1} of {stepLabels.length}: {stepLabels[step]}
        </CardTitle>
        <CardDescription>
          Answer a few questions and CodeMap will generate a project map you can build from.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {step === 0 && (
          <StartChoice templates={templates} onChoosePreset={choosePreset} onChooseScratch={chooseScratch} />
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value })}
                placeholder="BioCards"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="target-user">Who is this for?</Label>
              <Input
                id="target-user"
                value={draft.targetUser}
                onChange={(event) => updateDraft({ targetUser: event.target.value })}
                placeholder={selectedTemplate?.exampleTargetUser ?? "A student studying for an exam"}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="problem-statement">What problem does it solve?</Label>
              <Textarea
                id="problem-statement"
                value={draft.problemStatement}
                onChange={(event) => updateDraft({ problemStatement: event.target.value })}
                placeholder={
                  selectedTemplate?.exampleProblemStatement ?? "Describe the problem your app solves."
                }
                rows={3}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              {mode === "preset" && selectedTemplate
                ? `Starting from: ${selectedTemplate.label}`
                : "Starting from scratch"}{" "}
              —{" "}
              <button type="button" className="underline" onClick={() => setStep(0)}>
                change
              </button>
            </p>
          </div>
        )}

        {step === 2 && mode === "preset" && selectedTemplate && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Pick the features your first version should include. You can always add more later.
            </p>
            {selectedTemplate.features.map((feature) => (
              <label
                key={feature.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <Checkbox
                  checked={draft.selectedFeatureIds.includes(feature.id)}
                  onCheckedChange={(checked) => toggleFeature(feature.id, checked === true)}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{feature.label}</span>
                  <span className="text-sm text-muted-foreground">{feature.description}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 2 && mode === "custom" && (
          <ThingsEditor
            things={draft.thingDrafts}
            onChange={(thingDrafts) => updateDraft({ thingDrafts })}
          />
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label>How familiar are you with building apps?</Label>
              <RadioGroup
                value={draft.experienceLevel}
                onValueChange={(value) => updateDraft({ experienceLevel: value as ExperienceLevel })}
              >
                {[
                  { value: "new", label: "New to this — I'd like extra guidance" },
                  { value: "developing", label: "Developing my skills — some guidance is helpful" },
                  { value: "confident", label: "Confident — keep it brief" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={option.value} />
                    {option.label}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Solo or team project?</Label>
              <RadioGroup
                value={draft.teamMode}
                onValueChange={(value) => updateDraft({ teamMode: value as TeamMode })}
              >
                {[
                  { value: "solo", label: "Solo" },
                  { value: "team", label: "Team" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={option.value} />
                    {option.label}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <p className="text-sm text-muted-foreground">
              Target stack: Next.js website — runs with{" "}
              <code className="font-mono text-xs">npm run dev</code>, viewable in any browser.
            </p>
          </div>
        )}

        {step > 0 && (
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
            {step < stepLabels.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !basicsComplete : !middleStepComplete}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!basicsComplete || !middleStepComplete}>
                Generate project map
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
