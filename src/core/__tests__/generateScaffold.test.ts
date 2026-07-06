import { describe, expect, it } from "vitest";
import { buildCustomTemplate } from "@/core/blocks";
import { generateProjectMap } from "@/core/generateProjectMap";
import { generateScaffold } from "@/core/generateScaffold";
import type { ProjectSpec, ThingSpec } from "@/core/types";
import { flashcardApp } from "@/templates/flashcardApp";

function flashcardSpec(): ProjectSpec {
  return {
    name: "BioCards",
    templateId: flashcardApp.id,
    targetUser: "a student",
    problemStatement: "Reviewing vocab is slow.",
    experienceLevel: "developing",
    selectedFeatureIds: flashcardApp.features.map((feature) => feature.id),
    teamMode: "solo",
    stack: "nextjs-web",
  };
}

describe("generateScaffold", () => {
  it("emits one file per screen and component, plus the shared project files", () => {
    const map = generateProjectMap(flashcardSpec(), flashcardApp);
    const files = generateScaffold(map);
    const paths = files.map((file) => file.path);

    expect(paths).toContain("package.json");
    expect(paths).toContain("app/layout.tsx");
    expect(paths).toContain("models/types.ts");
    expect(paths).toContain("lib/storage.ts");
    expect(paths).toContain("lib/seedData.ts");
    expect(paths).toContain("README.md");

    for (const screen of map.screens) expect(paths).toContain(screen.routeFile);
    for (const component of map.components) {
      expect(paths).toContain(`components/${component.name}.tsx`);
    }

    // No duplicate paths.
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("produces valid JSON for package.json, named after the project", () => {
    const map = generateProjectMap(flashcardSpec(), flashcardApp);
    const files = generateScaffold(map);
    const packageJson = files.find((file) => file.path === "package.json")!;

    const parsed = JSON.parse(packageJson.contents);
    expect(parsed.name).toBe("biocards");
    expect(parsed.scripts.dev).toBe("next dev");
  });

  it("only assigns fields the model actually has when generating a create page", () => {
    // flashcardApp's Card model has no createdAt field, unlike Deck.
    const map = generateProjectMap(flashcardSpec(), flashcardApp);
    const files = generateScaffold(map);
    const createCard = files.find((file) => file.path === "app/decks/[deckId]/new-card/page.tsx")!;

    expect(createCard.contents).not.toContain("createdAt");
    expect(createCard.contents).toContain("deckId: params.deckId");

    const createDeck = files.find((file) => file.path === "app/decks/new/page.tsx")!;
    expect(createDeck.contents).toContain("createdAt: new Date().toISOString()");
  });

  it("scopes a nested list page to its parent via the route param", () => {
    const workout: ThingSpec = {
      id: "workout",
      name: "Workout",
      fields: [{ name: "date", type: "date" }],
      blockIds: ["list", "detail", "create"],
    };
    const exercise: ThingSpec = {
      id: "exercise",
      name: "Exercise",
      fields: [{ name: "name", type: "text" }],
      parentThingId: "workout",
      blockIds: ["list", "create", "toggle"],
    };
    const template = buildCustomTemplate([workout, exercise]);
    const spec: ProjectSpec = {
      name: "FitLog",
      templateId: template.id,
      targetUser: "someone tracking workouts",
      problemStatement: "People lose track of exercises.",
      experienceLevel: "developing",
      selectedFeatureIds: template.features.map((feature) => feature.id),
      teamMode: "solo",
      stack: "nextjs-web",
      things: [workout, exercise],
    };

    const map = generateProjectMap(spec, template);
    const files = generateScaffold(map);
    const exerciseList = files.find(
      (file) => file.path === "app/workouts/[workoutId]/exercises/page.tsx"
    )!;

    expect(exerciseList.contents).toContain("useParams<{ workoutId: string }>()");
    expect(exerciseList.contents).toContain("item.workoutId === params.workoutId");

    // isDone was added to the model because "toggle" was selected; the create
    // form must default it rather than leave it unassigned.
    const createExercise = files.find(
      (file) => file.path === "app/workouts/[workoutId]/exercises/new/page.tsx"
    )!;
    expect(createExercise.contents).toContain("isDone: false");
  });

  it("gives a generic, TODO-commented page to a screen that isn't list/detail/create/edit", () => {
    const map = generateProjectMap(flashcardSpec(), flashcardApp);
    const files = generateScaffold(map);
    const review = files.find((file) => file.path === "app/decks/[deckId]/review/page.tsx")!;

    expect(review.contents).toContain("TODO: build this screen");
  });
});
