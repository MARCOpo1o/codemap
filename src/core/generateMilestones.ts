import { MILESTONE_NAMES, MILESTONE_ORDER } from "./milestoneNames";
import type { GithubIssueSpec, Milestone, MilestoneId, ProjectTemplate } from "./types";

/**
 * Group generated issues into the fixed 4-stage milestone arc, using each
 * issue's milestone name to find its stage.
 */
export function generateMilestones(
  issues: GithubIssueSpec[],
  template: ProjectTemplate
): Milestone[] {
  const nameToId = new Map<string, MilestoneId>(
    MILESTONE_ORDER.map((id) => [MILESTONE_NAMES[id], id])
  );

  return MILESTONE_ORDER.map((id) => ({
    id,
    name: MILESTONE_NAMES[id],
    goal: template.milestoneGoals[id],
    issueTitles: issues
      .filter((issue) => nameToId.get(issue.milestone) === id)
      .map((issue) => issue.title),
  }));
}
