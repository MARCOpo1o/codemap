import { MILESTONE_NAMES } from "./milestoneNames";
import type { ExperienceLevel, FeatureDef, GithubIssueSpec, IssueDef, StackId } from "./types";

interface SetupIssue {
  id: string;
  title: string;
  summary: string;
  tasks: string[];
  acceptanceCriteria: string[];
}

function setupIssuesFor(stack: StackId): SetupIssue[] {
  if (stack === "expo-react-native") {
    return [
      {
        id: "issue-setup-init",
        title: "Initialize the Expo app",
        summary: "Get a blank Expo Router app running before adding any features.",
        tasks: [
          "Create a new Expo app with TypeScript and Expo Router",
          "Run it on a simulator or device to confirm it starts",
          "Commit the initial project as-is",
        ],
        acceptanceCriteria: ["The app builds and shows a default screen with no errors"],
      },
      {
        id: "issue-setup-structure",
        title: "Set up the project's folder structure",
        summary: "Create the folders the rest of the issues will build into.",
        tasks: [
          "Create components/, models/, and lib/ directories",
          "Add placeholder files so each folder is tracked by git",
        ],
        acceptanceCriteria: [
          "The project matches the suggested file tree before feature work starts",
        ],
      },
    ];
  }
  return [];
}

function buildConceptLookup(selectedFeatures: FeatureDef[]): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const feature of selectedFeatures) {
    for (const note of feature.learningNotes) {
      lookup.set(note.id, note.concept);
    }
  }
  return lookup;
}

function buildIssueBody(
  issue: IssueDef,
  experienceLevel: ExperienceLevel,
  conceptLookup: Map<string, string>
): string {
  const lines: string[] = [issue.summary, ""];

  lines.push("**Tasks**");
  for (const task of issue.tasks) lines.push(`- [ ] ${task}`);
  lines.push("");

  lines.push("**Acceptance criteria**");
  for (const criterion of issue.acceptanceCriteria) lines.push(`- ${criterion}`);

  const conceptNames = (issue.conceptIds ?? [])
    .map((id) => conceptLookup.get(id))
    .filter((name): name is string => Boolean(name));
  if (conceptNames.length > 0) {
    lines.push("", `**Concepts involved:** ${conceptNames.join(", ")}`);
  }

  if (experienceLevel !== "confident") {
    const guidance = issue.guidance?.[experienceLevel];
    if (guidance) lines.push("", `> Guidance: ${guidance}`);
  }

  return lines.join("\n");
}

function buildSetupIssueBody(issue: SetupIssue): string {
  const lines: string[] = [issue.summary, "", "**Tasks**"];
  for (const task of issue.tasks) lines.push(`- [ ] ${task}`);
  lines.push("", "**Acceptance criteria**");
  for (const criterion of issue.acceptanceCriteria) lines.push(`- ${criterion}`);
  return lines.join("\n");
}

/**
 * Generate GitHub issues: fixed setup issues for the target stack, followed
 * by the selected features' issues. Dependencies (IssueDef.dependsOnIssueIds)
 * are resolved to titles, dropping any that reference an issue that wasn't
 * generated (e.g. because its feature isn't selected).
 */
export function generateIssues(
  selectedFeatures: FeatureDef[],
  experienceLevel: ExperienceLevel,
  stack: StackId
): GithubIssueSpec[] {
  const setupIssues = setupIssuesFor(stack);
  const featureIssues = selectedFeatures.flatMap((feature) => feature.issues);

  const titleById = new Map<string, string>();
  for (const issue of setupIssues) titleById.set(issue.id, issue.title);
  for (const issue of featureIssues) titleById.set(issue.id, issue.title);

  const conceptLookup = buildConceptLookup(selectedFeatures);

  const generatedSetupIssues: GithubIssueSpec[] = setupIssues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    body: buildSetupIssueBody(issue),
    labels: ["setup"],
    milestone: MILESTONE_NAMES.setup,
    dependsOn: [],
  }));

  const generatedFeatureIssues: GithubIssueSpec[] = featureIssues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    body: buildIssueBody(issue, experienceLevel, conceptLookup),
    labels: issue.labels,
    milestone: MILESTONE_NAMES[issue.milestoneId],
    dependsOn: (issue.dependsOnIssueIds ?? [])
      .map((id) => titleById.get(id))
      .filter((title): title is string => Boolean(title)),
  }));

  return [...generatedSetupIssues, ...generatedFeatureIssues];
}
