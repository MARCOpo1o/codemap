import type { FeatureDef, ScreenSpec } from "./types";

/**
 * Merge screens from the selected features. Two features may contribute to
 * the same screen id (e.g. both touch the Review screen) — when that
 * happens their component references are combined and both features are
 * credited on the resulting ScreenSpec.
 */
export function generateScreens(selectedFeatures: FeatureDef[]): ScreenSpec[] {
  const byId = new Map<string, ScreenSpec>();

  for (const feature of selectedFeatures) {
    for (const screen of feature.screens) {
      const existing = byId.get(screen.id);
      if (!existing) {
        byId.set(screen.id, {
          id: screen.id,
          name: screen.name,
          purpose: screen.purpose,
          routeFile: screen.routeFile,
          componentIds: [...screen.componentIds],
          featureIds: [feature.id],
        });
        continue;
      }

      existing.componentIds = Array.from(
        new Set([...existing.componentIds, ...screen.componentIds])
      );
      existing.featureIds = Array.from(new Set([...existing.featureIds, feature.id]));
    }
  }

  return Array.from(byId.values());
}
