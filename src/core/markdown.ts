import type { GithubIssueSpec, Milestone, ReadmeSpec } from "./types";

/** Serialize a ReadmeSpec into a copy/download-ready README.md string. */
export function readmeToMarkdown(readme: ReadmeSpec): string {
  const parts = [`# ${readme.title}`, "", `_${readme.oneLiner}_`];

  for (const section of readme.sections) {
    parts.push("", `## ${section.heading}`, "", section.body);
  }

  return parts.join("\n");
}

/** Serialize a single issue into a markdown block suitable for pasting into GitHub. */
export function issueToMarkdown(issue: GithubIssueSpec): string {
  return [`### ${issue.title}`, "", issue.body].join("\n");
}

/** Serialize all issues, grouped by milestone, into one markdown document. */
export function issuesToMarkdown(issues: GithubIssueSpec[], milestones: Milestone[]): string {
  const parts: string[] = [];

  for (const milestone of milestones) {
    const milestoneIssues = issues.filter((issue) => issue.milestone === milestone.name);
    if (milestoneIssues.length === 0) continue;

    parts.push(`## ${milestone.name}`, "", milestone.goal, "");
    for (const issue of milestoneIssues) {
      parts.push(issueToMarkdown(issue), "");
    }
  }

  return parts.join("\n").trim();
}
