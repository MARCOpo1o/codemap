import type { MilestoneId } from "./types";

/**
 * Fixed 4-stage milestone arc used by every template. The stages themselves
 * don't change between templates — only the per-template goal text
 * (ProjectTemplate.milestoneGoals) does.
 */
export const MILESTONE_ORDER: MilestoneId[] = ["setup", "core", "features", "polish"];

export const MILESTONE_NAMES: Record<MilestoneId, string> = {
  setup: "Project setup",
  core: "Core flow working",
  features: "Feature complete",
  polish: "Polish, README, demo",
};
