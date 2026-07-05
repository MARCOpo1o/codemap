import type {
  ComponentSpec,
  FeatureDef,
  GithubIssueSpec,
  IssueDef,
  LearningNote,
  LearningNoteDef,
  ScreenSpec,
} from "./types";

/**
 * Merge learning notes from the selected features and cross-reference each
 * concept to the actual screens, components, files, and issues that touch
 * it, using names/titles instead of ids so the UI can render it directly.
 */
export function generateLearningNotes(
  selectedFeatures: FeatureDef[],
  screens: ScreenSpec[],
  components: ComponentSpec[],
  issues: GithubIssueSpec[]
): LearningNote[] {
  const screenNameById = new Map(screens.map((screen) => [screen.id, screen.name]));
  const componentNameById = new Map(components.map((component) => [component.id, component.name]));

  const issueTitleByConceptId = new Map<string, string[]>();
  const featureIssuesById = new Map<string, IssueDef>();
  for (const feature of selectedFeatures) {
    for (const issue of feature.issues) featureIssuesById.set(issue.id, issue);
  }
  for (const generatedIssue of issues) {
    const sourceIssue = featureIssuesById.get(generatedIssue.id);
    for (const conceptId of sourceIssue?.conceptIds ?? []) {
      const titles = issueTitleByConceptId.get(conceptId) ?? [];
      titles.push(generatedIssue.title);
      issueTitleByConceptId.set(conceptId, titles);
    }
  }

  const notesById = new Map<string, LearningNoteDef>();
  for (const feature of selectedFeatures) {
    for (const note of feature.learningNotes) {
      if (!notesById.has(note.id)) notesById.set(note.id, note);
    }
  }

  return Array.from(notesById.values()).map((note) => ({
    id: note.id,
    concept: note.concept,
    whyItMatters: note.whyItMatters,
    appearsIn: {
      screens: (note.appearsIn.screenIds ?? [])
        .map((id) => screenNameById.get(id))
        .filter((name): name is string => Boolean(name)),
      components: (note.appearsIn.componentIds ?? [])
        .map((id) => componentNameById.get(id))
        .filter((name): name is string => Boolean(name)),
      files: note.appearsIn.files ?? [],
      issues: issueTitleByConceptId.get(note.id) ?? [],
    },
  }));
}
