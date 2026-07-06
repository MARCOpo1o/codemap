/**
 * Core types for the CodeMap generator engine.
 *
 * The engine is pure TypeScript with no UI dependencies:
 * a ProjectSpec (user input) plus a ProjectTemplate (category definition)
 * deterministically produce a ProjectMap (the generated plan).
 */

// ---------------------------------------------------------------------------
// User input
// ---------------------------------------------------------------------------

export type ExperienceLevel = "new" | "developing" | "confident";
export type TeamMode = "solo" | "team";
export type StackId = "nextjs-web" | "expo-react-native";

/**
 * Sentinel templateId meaning "build the ProjectTemplate from spec.things
 * instead of looking one up in the template registry."
 */
export const CUSTOM_TEMPLATE_ID = "custom";

/** Everything the builder tells us in the wizard. */
export interface ProjectSpec {
  name: string;
  templateId: string;
  targetUser: string;
  problemStatement: string;
  experienceLevel: ExperienceLevel;
  selectedFeatureIds: string[];
  teamMode: TeamMode;
  stack: StackId;
  /** Present (and used) only when templateId === CUSTOM_TEMPLATE_ID. */
  things?: ThingSpec[];
}

// ---------------------------------------------------------------------------
// Compositional building blocks (custom, non-template projects)
// ---------------------------------------------------------------------------

export type ThingFieldType = "text" | "number" | "boolean" | "date";

export interface ThingFieldSpec {
  name: string;
  type: ThingFieldType;
}

/** A single building block a builder can attach to a Thing. */
export type BlockId = "list" | "detail" | "create" | "edit-delete" | "toggle" | "stats";

/**
 * A "thing" is a builder-named noun in their app — Deck, Habit, Event,
 * Recipe, whatever they're building around. Blocks describe what the app
 * can do with it; the engine expands each selected (thing, block) pair into
 * a full FeatureDef using the same shape a hand-authored template uses.
 */
export interface ThingSpec {
  id: string;
  name: string;
  fields: ThingFieldSpec[];
  /** If set, this thing is nested under another thing (Card belongs to Deck). */
  parentThingId?: string;
  blockIds: BlockId[];
}

// ---------------------------------------------------------------------------
// Template definitions (authored by contributors)
// ---------------------------------------------------------------------------

export interface FieldDef {
  name: string;
  type: string;
  description: string;
}

export interface DataModelDef {
  id: string;
  name: string;
  description: string;
  fields: FieldDef[];
}

export interface ScreenDef {
  id: string;
  name: string;
  purpose: string;
  /** Stack-neutral URL path, e.g. "/decks/[deckId]/review". "/" is the home page. */
  routePath: string;
  componentIds: string[];
}

export interface ComponentDef {
  id: string;
  name: string;
  description: string;
  usedOnScreenIds: string[];
  dataModelIds: string[];
}

export type MilestoneId = "setup" | "core" | "features" | "polish";

export interface IssueDef {
  id: string;
  title: string;
  summary: string;
  tasks: string[];
  acceptanceCriteria: string[];
  labels: string[];
  milestoneId: MilestoneId;
  dependsOnIssueIds?: string[];
  /** Learning-note concepts this issue exercises. */
  conceptIds?: string[];
  /** Extra guidance included for less experienced builders. */
  guidance?: Partial<Record<Exclude<ExperienceLevel, "confident">, string>>;
}

export interface LearningNoteDef {
  id: string;
  concept: string;
  whyItMatters: string;
  appearsIn: {
    screenIds?: string[];
    componentIds?: string[];
    files?: string[];
  };
}

/**
 * A selectable feature within a template. Each feature declares the screens,
 * components, data models, issues, and learning notes it contributes.
 * Screens and data models with the same id across features are merged.
 */
export interface FeatureDef {
  id: string;
  label: string;
  description: string;
  /** Core features are pre-selected in the wizard and recommended for a first pass. */
  core?: boolean;
  screens: ScreenDef[];
  components: ComponentDef[];
  dataModels: DataModelDef[];
  issues: IssueDef[];
  learningNotes: LearningNoteDef[];
}

/** A reusable project category (flashcard app, habit tracker, ...). */
export interface ProjectTemplate {
  id: string;
  label: string;
  shortDescription: string;
  description: string;
  /** Placeholder text that helps the builder phrase their own problem statement. */
  exampleProblemStatement: string;
  exampleTargetUser: string;
  features: FeatureDef[];
  /** Template-specific goal text per milestone stage. */
  milestoneGoals: Record<MilestoneId, string>;
}

// ---------------------------------------------------------------------------
// Generated output — the ProjectMap
// ---------------------------------------------------------------------------

export interface ScreenSpec {
  id: string;
  name: string;
  purpose: string;
  /** The URL where this screen lives, e.g. "/decks". */
  routePath: string;
  /** The file that renders it for the chosen stack, e.g. "app/decks/page.tsx". */
  routeFile: string;
  componentIds: string[];
  featureIds: string[];
}

export interface ComponentSpec {
  id: string;
  name: string;
  description: string;
  usedOnScreenIds: string[];
  dataModelIds: string[];
  featureId: string;
}

export interface DataModelSpec {
  id: string;
  name: string;
  description: string;
  fields: FieldDef[];
}

export interface FileNode {
  name: string;
  type: "file" | "dir";
  explanation: string;
  children?: FileNode[];
}

export interface GithubIssueSpec {
  id: string;
  title: string;
  body: string;
  labels: string[];
  milestone: string;
  dependsOn: string[];
}

export interface Milestone {
  id: MilestoneId;
  name: string;
  goal: string;
  issueTitles: string[];
}

export interface LearningNote {
  id: string;
  concept: string;
  whyItMatters: string;
  appearsIn: {
    screens: string[];
    components: string[];
    files: string[];
    issues: string[];
  };
}

export interface ReadmeSection {
  heading: string;
  body: string;
}

export interface ReadmeSpec {
  title: string;
  oneLiner: string;
  sections: ReadmeSection[];
}

/** A suggested area of ownership when building as a team. */
export interface TaskArea {
  name: string;
  focus: string;
  screenNames: string[];
  issueTitles: string[];
  sharedTouchpoints: string[];
}

export interface GettingStartedStep {
  title: string;
  body: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

/** A first-run walkthrough (install -> run -> see it -> change it) plus a plain-language glossary. */
export interface GettingStartedSpec {
  steps: GettingStartedStep[];
  glossary: GlossaryTerm[];
}

/**
 * The ProjectMap is CodeMap's core object: a complete, cross-referenced plan
 * connecting features to screens, components, data models, files, issues,
 * milestones, documentation, and the concepts worth understanding on the way.
 */
export interface ProjectMap {
  spec: ProjectSpec;
  templateLabel: string;
  summary: string;
  screens: ScreenSpec[];
  components: ComponentSpec[];
  dataModels: DataModelSpec[];
  fileTree: FileNode;
  issues: GithubIssueSpec[];
  milestones: Milestone[];
  readme: ReadmeSpec;
  learningNotes: LearningNote[];
  taskSplit?: TaskArea[];
  gettingStarted: GettingStartedSpec;
}

/** One file in a generated, runnable project scaffold. */
export interface ScaffoldFile {
  path: string;
  contents: string;
}
