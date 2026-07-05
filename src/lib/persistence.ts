import type { ProjectSpec } from "@/core/types";

const LAST_SPEC_KEY = "codemap:last-spec";

/**
 * The map is always regenerated from the saved spec (not cached itself), so
 * a generator change never leaves a stale map sitting in local storage.
 */
export function saveLastSpec(spec: ProjectSpec): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_SPEC_KEY, JSON.stringify(spec));
  } catch {
    // Storage can be unavailable (private browsing, quota) — losing the
    // draft is an acceptable degradation, not a crash.
  }
}

export function loadLastSpec(): ProjectSpec | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_SPEC_KEY);
    return raw ? (JSON.parse(raw) as ProjectSpec) : null;
  } catch {
    return null;
  }
}

export function clearLastSpec(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LAST_SPEC_KEY);
  } catch {
    // Nothing to clean up if storage isn't available.
  }
}
