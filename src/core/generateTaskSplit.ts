import type {
  ComponentSpec,
  DataModelSpec,
  FeatureDef,
  GithubIssueSpec,
  ScreenSpec,
  TaskArea,
} from "./types";

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Split the selected features into 1-4 contiguous work areas for team
 * projects, so a team can divide screens and issues by feature instead of
 * everyone touching the same files at once.
 */
export function generateTaskSplit(
  selectedFeatures: FeatureDef[],
  screens: ScreenSpec[],
  components: ComponentSpec[],
  dataModels: DataModelSpec[],
  issues: GithubIssueSpec[]
): TaskArea[] {
  if (selectedFeatures.length === 0) return [];

  const numAreas = Math.min(4, Math.max(1, Math.ceil(selectedFeatures.length / 2)));
  const areaSize = Math.ceil(selectedFeatures.length / numAreas);
  const featureGroups = chunk(selectedFeatures, areaSize);

  const issueFeatureId = new Map<string, string>();
  for (const feature of selectedFeatures) {
    for (const issue of feature.issues) issueFeatureId.set(issue.id, feature.id);
  }

  const modelUsageCount = new Map<string, number>();
  for (const group of featureGroups) {
    const groupFeatureIds = new Set(group.map((feature) => feature.id));
    const modelsInGroup = new Set(
      components
        .filter((component) => groupFeatureIds.has(component.featureId))
        .flatMap((component) => component.dataModelIds)
    );
    for (const modelId of modelsInGroup) {
      modelUsageCount.set(modelId, (modelUsageCount.get(modelId) ?? 0) + 1);
    }
  }

  const dataModelNameById = new Map(dataModels.map((model) => [model.id, model.name]));

  return featureGroups.map((group, index) => {
    const groupFeatureIds = new Set(group.map((feature) => feature.id));

    const screenNames = screens
      .filter((screen) => screen.featureIds.some((id) => groupFeatureIds.has(id)))
      .map((screen) => screen.name);

    const issueTitles = issues
      .filter((issue) => groupFeatureIds.has(issueFeatureId.get(issue.id) ?? ""))
      .map((issue) => issue.title);

    const sharedModelNames = Array.from(modelUsageCount.entries())
      .filter(([, count]) => count > 1)
      .map(([modelId]) => dataModelNameById.get(modelId) ?? modelId);

    return {
      name: `Track ${index + 1}`,
      focus: group.map((feature) => feature.label).join(" + "),
      screenNames,
      issueTitles,
      sharedTouchpoints: [
        "models/types.ts",
        "lib/storage.ts",
        ...sharedModelNames.map((name) => `${name} data model`),
      ],
    };
  });
}
