"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ExperienceLevel, ProjectSpec, ProjectTemplate, TeamMode } from "@/core/types";

interface ProjectWizardProps {
  templates: ProjectTemplate[];
  initialSpec?: ProjectSpec | null;
  initialTemplateId?: string;
  onGenerate: (spec: ProjectSpec) => void;
}

type Draft = {
  name: string;
  templateId: string;
  targetUser: string;
  problemStatement: string;
  selectedFeatureIds: string[];
  experienceLevel: ExperienceLevel;
  teamMode: TeamMode;
};

function defaultCoreFeatureIds(template: ProjectTemplate | undefined): string[] {
  if (!template) return [];
  return template.features.filter((feature) => feature.core).map((feature) => feature.id);
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
      experienceLevel: spec.experienceLevel,
      teamMode: spec.teamMode,
    };
  }
  const preselected = templates.find((template) => template.id === initialTemplateId);
  const firstTemplate = preselected ?? templates[0];
  return {
    name: "",
    templateId: firstTemplate?.id ?? "",
    targetUser: "",
    problemStatement: "",
    selectedFeatureIds: defaultCoreFeatureIds(firstTemplate),
    experienceLevel: "developing",
    teamMode: "solo",
  };
}

const STEP_LABELS = ["Basics", "Features", "Context"];

export function ProjectWizard({
  templates,
  initialSpec,
  initialTemplateId,
  onGenerate,
}: ProjectWizardProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() =>
    draftFromSpec(initialSpec, templates, initialTemplateId)
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === draft.templateId),
    [templates, draft.templateId]
  );

  function updateDraft(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleTemplateChange(templateId: string | null) {
    if (!templateId) return;
    const nextTemplate = templates.find((template) => template.id === templateId);
    updateDraft({
      templateId,
      selectedFeatureIds: defaultCoreFeatureIds(nextTemplate),
    });
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

  function handleSubmit() {
    if (!selectedTemplate) return;
    const spec: ProjectSpec = {
      name: draft.name.trim(),
      templateId: draft.templateId,
      targetUser: draft.targetUser.trim(),
      problemStatement: draft.problemStatement.trim(),
      experienceLevel: draft.experienceLevel,
      selectedFeatureIds: draft.selectedFeatureIds,
      teamMode: draft.teamMode,
      stack: "expo-react-native",
    };
    onGenerate(spec);
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
        </CardTitle>
        <CardDescription>
          Answer a few questions and CodeMap will generate a project map you can build from.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {step === 0 && (
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
              <Label htmlFor="template">Project category</Label>
              <Select value={draft.templateId} onValueChange={handleTemplateChange}>
                <SelectTrigger id="template" className="w-full">
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-sm text-muted-foreground">{selectedTemplate.shortDescription}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="target-user">Who is this for?</Label>
              <Input
                id="target-user"
                value={draft.targetUser}
                onChange={(event) => updateDraft({ targetUser: event.target.value })}
                placeholder={selectedTemplate?.exampleTargetUser}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="problem-statement">What problem does it solve?</Label>
              <Textarea
                id="problem-statement"
                value={draft.problemStatement}
                onChange={(event) => updateDraft({ problemStatement: event.target.value })}
                placeholder={selectedTemplate?.exampleProblemStatement}
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 1 && selectedTemplate && (
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

        {step === 2 && (
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
              Target stack: Expo (React Native + TypeScript).
            </p>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            Back
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 ? !basicsComplete : !featuresComplete}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!basicsComplete || !featuresComplete}>
              Generate project map
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
