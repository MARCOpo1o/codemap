import { toKebabCase } from "./naming";
import { CUSTOM_TEMPLATE_ID } from "./types";
import type {
  BlockId,
  DataModelSpec,
  FeatureDef,
  FieldDef,
  MilestoneId,
  ProjectTemplate,
  ThingFieldSpec,
  ThingSpec,
} from "./types";

/** Metadata for the blocks a builder can attach to a thing — used by the wizard. */
export const BLOCK_DEFINITIONS: Record<BlockId, { label: string; description: string }> = {
  list: { label: "List", description: "A screen showing every one of these." },
  detail: { label: "Detail", description: "A screen showing one of these in full." },
  create: { label: "Create", description: "A form to add a new one." },
  "edit-delete": { label: "Edit & delete", description: "Update or remove an existing one." },
  toggle: { label: "Mark done", description: "A quick way to mark one done or not done." },
  stats: { label: "Stats", description: "A summary count shown alongside the list." },
};

function pluralize(word: string): string {
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  return `${word}s`;
}

function pluralSlug(thing: ThingSpec): string {
  return toKebabCase(pluralize(thing.name));
}

function findThing(things: ThingSpec[], id: string): ThingSpec | undefined {
  return things.find((thing) => thing.id === id);
}

function listRoute(thing: ThingSpec, things: ThingSpec[]): string {
  const parent = thing.parentThingId ? findThing(things, thing.parentThingId) : undefined;
  if (parent) return `${detailRoute(parent, things)}/${pluralSlug(thing)}`;
  return `/${pluralSlug(thing)}`;
}

function detailRoute(thing: ThingSpec, things: ThingSpec[]): string {
  return `${listRoute(thing, things)}/[${thing.id}Id]`;
}

function createRoute(thing: ThingSpec, things: ThingSpec[]): string {
  return `${listRoute(thing, things)}/new`;
}

function editRoute(thing: ThingSpec, things: ThingSpec[]): string {
  return `${detailRoute(thing, things)}/edit`;
}

function fieldTypeLabel(type: ThingFieldSpec["type"]): string {
  switch (type) {
    case "text":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "date":
      return "string (date)";
  }
}

/**
 * The data model for a thing is built once, from the thing itself — every
 * block that touches this thing includes the same definition, and
 * generateDataModels keeps the first one it sees (they're always identical).
 */
function buildDataModel(thing: ThingSpec, things: ThingSpec[]): DataModelSpec {
  const fields: FieldDef[] = [
    { name: "id", type: "string", description: "Unique identifier." },
  ];

  const parent = thing.parentThingId ? findThing(things, thing.parentThingId) : undefined;
  if (parent) {
    fields.push({
      name: `${parent.id}Id`,
      type: "string",
      description: `The ${parent.name.toLowerCase()} this ${thing.name.toLowerCase()} belongs to.`,
    });
  }

  for (const field of thing.fields) {
    fields.push({
      name: field.name,
      type: fieldTypeLabel(field.type),
      description: `${field.name} for this ${thing.name.toLowerCase()}.`,
    });
  }

  if (thing.blockIds.includes("toggle") && !thing.fields.some((f) => f.name === "isDone")) {
    fields.push({
      name: "isDone",
      type: "boolean",
      description: `Whether this ${thing.name.toLowerCase()} has been marked done.`,
    });
  }

  fields.push({
    name: "createdAt",
    type: "string",
    description: "ISO timestamp for sorting.",
  });

  return {
    id: thing.id,
    name: thing.name,
    description: `A ${thing.name.toLowerCase()} in the app.`,
    fields,
  };
}

function issueIdFor(thing: ThingSpec, block: BlockId): string {
  return `issue-${thing.id}-${block}`;
}

function dependsOnIfSelected(thing: ThingSpec, block: BlockId): string[] {
  return thing.blockIds.includes(block) ? [issueIdFor(thing, block)] : [];
}

/** Expand one (thing, block) pair into a full FeatureDef. */
function buildFeatureForBlock(thing: ThingSpec, block: BlockId, things: ThingSpec[]): FeatureDef {
  const plural = pluralize(thing.name);
  const lower = thing.name.toLowerCase();
  const dataModel = buildDataModel(thing, things);
  const milestoneId: MilestoneId =
    block === "list" || block === "detail" ? "core" : "features";

  switch (block) {
    case "list": {
      const screenId = `${thing.id}-list`;
      const componentId = `${thing.id}-card`;
      return {
        id: `${thing.id}-list`,
        label: `${plural} list`,
        description: `Screen listing every ${lower}.`,
        core: true,
        screens: [
          {
            id: screenId,
            name: `${plural} List`,
            purpose: `Shows every ${lower} the user has created.`,
            routePath: listRoute(thing, things),
            componentIds: [componentId],
          },
        ],
        components: [
          {
            id: componentId,
            name: `${thing.name}Card`,
            description: `Displays a ${lower}'s summary in the list.`,
            usedOnScreenIds: [screenId],
            dataModelIds: [thing.id],
          },
        ],
        dataModels: [dataModel],
        issues: [
          {
            id: issueIdFor(thing, "list"),
            title: `Show a list of ${plural.toLowerCase()}`,
            summary: `Render every saved ${lower} so the user can see what they have.`,
            tasks: [
              `Define the ${thing.name} data model`,
              `Load ${plural.toLowerCase()} from storage`,
              `Render them using the ${thing.name}Card component`,
              "Handle the empty state (none yet)",
            ],
            acceptanceCriteria: [
              `The list screen shows one ${thing.name}Card per saved ${lower}`,
              "An empty list shows a friendly empty state instead of a blank screen",
            ],
            labels: ["feature"],
            milestoneId,
            conceptIds: [`${thing.id}-list-note`],
            guidance: {
              new: `Start by hardcoding an array of ${plural.toLowerCase()}, get the list rendering, then swap it for stored data.`,
            },
          },
        ],
        learningNotes: [
          {
            id: `${thing.id}-list-note`,
            concept: "Rendering lists of data",
            whyItMatters:
              "Most real apps are lists of things. Learning to map data into repeated components is one of the most reusable skills in app development.",
            appearsIn: { screenIds: [screenId], componentIds: [componentId] },
          },
        ],
      };
    }

    case "detail": {
      const screenId = `${thing.id}-detail`;
      const children = things.filter((candidate) => candidate.parentThingId === thing.id);
      const linksToChildren = children.filter((child) => child.blockIds.includes("list"));
      const purpose =
        linksToChildren.length > 0
          ? `Shows a single ${lower}'s full details and links to its ${linksToChildren
              .map((child) => pluralize(child.name).toLowerCase())
              .join(", ")}.`
          : `Shows a single ${lower}'s full details.`;

      return {
        id: `${thing.id}-detail`,
        label: `${thing.name} detail`,
        description: `Screen showing one ${lower} in full.`,
        core: true,
        screens: [
          {
            id: screenId,
            name: `${thing.name} Detail`,
            purpose,
            routePath: detailRoute(thing, things),
            componentIds: [],
          },
        ],
        components: [],
        dataModels: [dataModel],
        issues: [
          {
            id: issueIdFor(thing, "detail"),
            title: `Build the ${thing.name.toLowerCase()} detail screen`,
            summary: `Show a single ${lower}'s full details when the user opens it.`,
            tasks: [
              `Read the ${thing.id}Id route parameter`,
              `Load and display that ${lower}'s details`,
            ],
            acceptanceCriteria: [`Opening a ${lower} shows its detail screen`],
            labels: ["feature"],
            milestoneId,
            dependsOnIssueIds: dependsOnIfSelected(thing, "list"),
            conceptIds: [`${thing.id}-detail-note`],
          },
        ],
        learningNotes: [
          {
            id: `${thing.id}-detail-note`,
            concept: "Passing data between screens",
            whyItMatters:
              "Screens usually need to know which item they're showing. Reading an id from the route is how most apps carry that context across navigation.",
            appearsIn: { screenIds: [screenId] },
          },
        ],
      };
    }

    case "create": {
      const screenId = `${thing.id}-create`;
      const parent = thing.parentThingId ? findThing(things, thing.parentThingId) : undefined;
      const fieldNames = thing.fields.map((field) => field.name).join(", ") || "its details";
      const tasks = [`Build a form with inputs for ${fieldNames}`];
      if (parent) {
        tasks.push(`Read the ${parent.id}Id route parameter and save it on the new ${lower}`);
      }
      tasks.push(`Save the new ${lower} to storage`, "Navigate back after saving");

      return {
        id: `${thing.id}-create`,
        label: `Create a ${lower}`,
        description: `Form to add a new ${lower}.`,
        core: true,
        screens: [
          {
            id: screenId,
            name: `Create ${thing.name}`,
            purpose: `Form to create a new ${lower}.`,
            routePath: createRoute(thing, things),
            componentIds: [],
          },
        ],
        components: [],
        dataModels: [dataModel],
        issues: [
          {
            id: issueIdFor(thing, "create"),
            title: `Create a new ${lower}`,
            summary: `Let a user add a ${lower} before doing anything else with it.`,
            tasks,
            acceptanceCriteria: [
              `Submitting a valid form creates a ${lower} and saves it to storage`,
              "Missing required fields show a validation message instead of saving",
            ],
            labels: ["feature"],
            milestoneId,
            dependsOnIssueIds: dependsOnIfSelected(thing, "list"),
            conceptIds: [`${thing.id}-create-note`],
          },
        ],
        learningNotes: [
          {
            id: `${thing.id}-create-note`,
            concept: "Validating user input",
            whyItMatters:
              "Almost every app has a form somewhere. Deciding what counts as valid input, and giving clear feedback when it isn't, is a core product and engineering skill.",
            appearsIn: { screenIds: [screenId] },
          },
        ],
      };
    }

    case "edit-delete": {
      const screenId = `${thing.id}-edit`;
      const componentId = `${thing.id}-delete-button`;
      return {
        id: `${thing.id}-edit-delete`,
        label: `Edit & delete a ${lower}`,
        description: `Update or remove an existing ${lower}.`,
        screens: [
          {
            id: screenId,
            name: `Edit ${thing.name}`,
            purpose: `Form to update or delete an existing ${lower}.`,
            routePath: editRoute(thing, things),
            componentIds: [componentId],
          },
        ],
        components: [
          {
            id: componentId,
            name: `${thing.name}DeleteButton`,
            description: `Deletes the current ${lower} after the user confirms.`,
            usedOnScreenIds: [screenId],
            dataModelIds: [thing.id],
          },
        ],
        dataModels: [dataModel],
        issues: [
          {
            id: issueIdFor(thing, "edit-delete"),
            title: `Edit and delete a ${lower}`,
            summary: `Let a user change a ${lower}'s details or remove it entirely.`,
            tasks: [
              "Prefill the form with the existing values",
              "Save changes back to storage",
              "Add a delete action with a confirmation step",
              "Navigate back after deleting",
            ],
            acceptanceCriteria: [
              `Editing and saving updates the ${lower} in storage`,
              `Deleting removes the ${lower} and confirms first`,
            ],
            labels: ["enhancement"],
            milestoneId,
            dependsOnIssueIds: [
              ...dependsOnIfSelected(thing, "detail"),
              ...(thing.blockIds.includes("detail") ? [] : dependsOnIfSelected(thing, "list")),
            ],
            conceptIds: [`${thing.id}-edit-delete-note`],
          },
        ],
        learningNotes: [
          {
            id: `${thing.id}-edit-delete-note`,
            concept: "Confirming destructive actions",
            whyItMatters:
              "Deleting something is hard to undo. Asking for confirmation before a destructive action is a small bit of UX that prevents real frustration.",
            appearsIn: { screenIds: [screenId], componentIds: [componentId] },
          },
        ],
      };
    }

    case "toggle": {
      const componentId = `${thing.id}-toggle`;
      const usedOn = thing.blockIds.includes("list")
        ? [`${thing.id}-list`]
        : thing.blockIds.includes("detail")
          ? [`${thing.id}-detail`]
          : [];
      return {
        id: `${thing.id}-toggle`,
        label: `Mark a ${lower} done`,
        description: `A quick way to mark a ${lower} done or not done.`,
        screens: [],
        components: [
          {
            id: componentId,
            name: `${thing.name}ToggleButton`,
            description: `Marks a ${lower} as done or not done.`,
            usedOnScreenIds: usedOn,
            dataModelIds: [thing.id],
          },
        ],
        dataModels: [dataModel],
        issues: [
          {
            id: issueIdFor(thing, "toggle"),
            title: `Mark a ${lower} as done`,
            summary: `Let a user flip a ${lower} between done and not done.`,
            tasks: [
              `Make sure the ${thing.name} model has an isDone field`,
              "Add a toggle control that flips it",
              "Persist the change to storage",
            ],
            acceptanceCriteria: [`Tapping the toggle flips the ${lower}'s done state and saves it`],
            labels: ["enhancement"],
            milestoneId,
            dependsOnIssueIds: [
              ...dependsOnIfSelected(thing, "list"),
              ...dependsOnIfSelected(thing, "detail"),
            ],
            conceptIds: [`${thing.id}-toggle-note`],
          },
        ],
        learningNotes: [
          {
            id: `${thing.id}-toggle-note`,
            concept: "Local state vs. persisted state",
            whyItMatters:
              "Whether something is marked done needs to survive closing and reopening the app, which means it belongs in storage, not just component state.",
            appearsIn: { componentIds: [componentId] },
          },
        ],
      };
    }

    case "stats": {
      const componentId = `${thing.id}-stats`;
      const usedOn = thing.blockIds.includes("list") ? [`${thing.id}-list`] : [];
      const countsDone = thing.blockIds.includes("toggle");
      return {
        id: `${thing.id}-stats`,
        label: `${plural} stats`,
        description: `A summary count shown alongside the ${lower} list.`,
        screens: [],
        components: [
          {
            id: componentId,
            name: `${plural}Stats`,
            description: `Shows a quick summary count for ${plural.toLowerCase()}.`,
            usedOnScreenIds: usedOn,
            dataModelIds: [thing.id],
          },
        ],
        dataModels: [dataModel],
        issues: [
          {
            id: issueIdFor(thing, "stats"),
            title: `Show a summary count for ${plural.toLowerCase()}`,
            summary: `Give the user a quick sense of how many ${plural.toLowerCase()} they have.`,
            tasks: [
              `Count the total number of ${plural.toLowerCase()}`,
              ...(countsDone ? ["Count how many are marked done"] : []),
              "Render the counts in the Stats component",
            ],
            acceptanceCriteria: [`The stats update as ${plural.toLowerCase()} are added or changed`],
            labels: ["enhancement"],
            milestoneId,
            dependsOnIssueIds: dependsOnIfSelected(thing, "list"),
            conceptIds: [`${thing.id}-stats-note`],
          },
        ],
        learningNotes: [
          {
            id: `${thing.id}-stats-note`,
            concept: "Deriving values instead of storing them",
            whyItMatters:
              "A count can be calculated from the data itself rather than tracked as its own field — a habit that avoids state going out of sync.",
            appearsIn: { componentIds: [componentId] },
          },
        ],
      };
    }
  }
}

/** Expand every thing's selected blocks into FeatureDefs. */
export function buildFeaturesFromThings(things: ThingSpec[]): FeatureDef[] {
  return things.flatMap((thing) => thing.blockIds.map((block) => buildFeatureForBlock(thing, block, things)));
}

/**
 * Build an in-memory ProjectTemplate from builder-defined things, so a
 * custom project flows through the exact same generateProjectMap pipeline
 * as a hand-authored template.
 */
export function buildCustomTemplate(things: ThingSpec[]): ProjectTemplate {
  return {
    id: CUSTOM_TEMPLATE_ID,
    label: "Custom Project",
    shortDescription: "Your own idea, built from your own things and building blocks.",
    description: "A custom project built from things and building blocks you defined yourself.",
    exampleProblemStatement: "Describe the problem your app solves.",
    exampleTargetUser: "Describe who this app is for.",
    milestoneGoals: {
      setup: "Project runs locally with a home screen and navigation working.",
      core: "A user can view the main data in the app.",
      features: "All selected building blocks work end to end.",
      polish: "README, screenshots, and a short demo are ready to share.",
    },
    features: buildFeaturesFromThings(things),
  };
}
