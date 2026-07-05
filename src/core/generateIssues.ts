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
  if (stack === "nextjs-web") {
    return [
      {
        id: "issue-setup-init",
        title: "Create your Next.js app and see it in the browser",
        summary:
          "Get a blank website running on your own computer before adding any features.",
        tasks: [
          "Run `npx create-next-app@latest` and answer the prompts (say yes to TypeScript)",
          "Start it with `npm run dev`",
          "Open http://localhost:3000 in your browser — this is your website",
          "Change some text in `app/page.tsx`, save, and watch the browser update",
          "Commit the initial project as-is",
        ],
        acceptanceCriteria: [
          "The site loads at http://localhost:3000 with no errors",
          "You changed something in app/page.tsx and saw it appear in the browser",
        ],
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

/** Fixed wrap-up issues appended after feature work, per stack. */
function polishIssuesFor(stack: StackId): SetupIssue[] {
  if (stack === "nextjs-web") {
    return [
      {
        id: "issue-polish-deploy",
        title: "Put your website on the internet",
        summary:
          "Deploy the app so anyone can visit it at a real URL — not just on your computer.",
        tasks: [
          "Push your latest work to GitHub",
          "Sign in to vercel.com with your GitHub account",
          "Import your repository and click Deploy",
          "Open the URL Vercel gives you and test the app there",
          "Add the live URL to the top of your README",
        ],
        acceptanceCriteria: [
          "The app works at a public URL anyone can open",
          "The README links to the live site",
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
  const polishIssues = polishIssuesFor(stack);
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

  const generatedPolishIssues: GithubIssueSpec[] = polishIssues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    body: buildSetupIssueBody(issue),
    labels: ["deploy"],
    milestone: MILESTONE_NAMES.polish,
    dependsOn: [],
  }));

  return [...generatedSetupIssues, ...generatedFeatureIssues, ...generatedPolishIssues];
}
