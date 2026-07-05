import type { ComponentSpec, FeatureDef } from "./types";

/**
 * Merge components from the selected features. The first feature to define
 * a given component id is credited as its owner; later definitions of the
 * same id only contribute additional screen/data-model references.
 */
export function generateComponents(selectedFeatures: FeatureDef[]): ComponentSpec[] {
  const byId = new Map<string, ComponentSpec>();

  for (const feature of selectedFeatures) {
    for (const component of feature.components) {
      const existing = byId.get(component.id);
      if (!existing) {
        byId.set(component.id, {
          id: component.id,
          name: component.name,
          description: component.description,
          usedOnScreenIds: [...component.usedOnScreenIds],
          dataModelIds: [...component.dataModelIds],
          featureId: feature.id,
        });
        continue;
      }

      existing.usedOnScreenIds = Array.from(
        new Set([...existing.usedOnScreenIds, ...component.usedOnScreenIds])
      );
      existing.dataModelIds = Array.from(
        new Set([...existing.dataModelIds, ...component.dataModelIds])
      );
    }
  }

  return Array.from(byId.values());
}
