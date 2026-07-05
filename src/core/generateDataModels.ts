import type { DataModelSpec, FeatureDef } from "./types";

/**
 * Merge data models from the selected features. Only the first feature to
 * define a given model id sets its fields — later features typically just
 * reference an existing model (e.g. a component that reads Card without
 * redefining it).
 */
export function generateDataModels(selectedFeatures: FeatureDef[]): DataModelSpec[] {
  const byId = new Map<string, DataModelSpec>();

  for (const feature of selectedFeatures) {
    for (const model of feature.dataModels) {
      if (byId.has(model.id)) continue;
      byId.set(model.id, {
        id: model.id,
        name: model.name,
        description: model.description,
        fields: [...model.fields],
      });
    }
  }

  return Array.from(byId.values());
}
