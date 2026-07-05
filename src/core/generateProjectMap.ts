import { generateComponents } from "./generateComponents";
import { generateDataModels } from "./generateDataModels";
import { generateFileTree } from "./generateFileTree";
import { generateIssues } from "./generateIssues";
import { generateLearningNotes } from "./generateLearningNotes";
import { generateMilestones } from "./generateMilestones";
import { generateReadme } from "./generateReadme";
import { generateScreens } from "./generateScreens";
import { generateTaskSplit } from "./generateTaskSplit";
import type { FeatureDef, ProjectMap, ProjectSpec, ProjectTemplate } from "./types";

function selectFeatures(spec: ProjectSpec, template: ProjectTemplate): FeatureDef[] {
  const selectedIds = new Set(spec.selectedFeatureIds);
  return template.features.filter((feature) => selectedIds.has(feature.id));
}

function buildSummary(spec: ProjectSpec, template: ProjectTemplate): string {
  return `${spec.name} is a ${template.label.toLowerCase()} for ${spec.targetUser}. ${spec.problemStatement}`;
}

/**
 * Turn a ProjectSpec and its ProjectTemplate into a complete ProjectMap:
 * screens, components, data models, a file tree, GitHub issues, milestones,
 * a README draft, learning notes, and (for team projects) a task split.
 */
export function generateProjectMap(spec: ProjectSpec, template: ProjectTemplate): ProjectMap {
  const selectedFeatures = selectFeatures(spec, template);

  const screens = generateScreens(selectedFeatures, spec.stack);
  const components = generateComponents(selectedFeatures);
  const dataModels = generateDataModels(selectedFeatures);
  const fileTree = generateFileTree(spec.name, screens, components, dataModels, spec.stack);
  const issues = generateIssues(selectedFeatures, spec.experienceLevel, spec.stack);
  const milestones = generateMilestones(issues, template);
  const readme = generateReadme(spec, selectedFeatures, screens, dataModels);
  const learningNotes = generateLearningNotes(selectedFeatures, screens, components, issues);
  const taskSplit =
    spec.teamMode === "team"
      ? generateTaskSplit(selectedFeatures, screens, components, dataModels, issues)
      : undefined;

  return {
    spec,
    templateLabel: template.label,
    summary: buildSummary(spec, template),
    screens,
    components,
    dataModels,
    fileTree,
    issues,
    milestones,
    readme,
    learningNotes,
    taskSplit,
  };
}
