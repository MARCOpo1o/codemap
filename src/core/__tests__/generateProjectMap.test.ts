import { describe, expect, it } from "vitest";
import { generateProjectMap } from "@/core/generateProjectMap";
import type { ProjectSpec } from "@/core/types";
import { flashcardApp } from "@/templates/flashcardApp";

function buildSpec(overrides: Partial<ProjectSpec> = {}): ProjectSpec {
  return {
    name: "BioCards",
    templateId: flashcardApp.id,
    targetUser: "a student studying for a biology exam",
    problemStatement: "Biology students need a fast way to review vocabulary before exams.",
    experienceLevel: "new",
    selectedFeatureIds: ["deck-list", "card-review", "create-card"],
    teamMode: "solo",
    stack: "nextjs-web",
    ...overrides,
  };
}

describe("generateProjectMap", () => {
  it("produces the expected screens, components, and data models for the core features", () => {
    const map = generateProjectMap(buildSpec(), flashcardApp);

    expect(map.screens.map((screen) => screen.name).sort()).toEqual(
      ["Create Card", "Create Deck", "Deck List", "Home", "Review"].sort()
    );
    expect(map.components.map((component) => component.name).sort()).toEqual(
      ["DeckCard", "FlashcardCard"].sort()
    );
    expect(map.dataModels.map((model) => model.name).sort()).toEqual(["Card", "Deck"].sort());
  });

  it("only includes issues for selected features, plus fixed setup issues", () => {
    const map = generateProjectMap(buildSpec({ selectedFeatureIds: ["deck-list"] }), flashcardApp);

    const titles = map.issues.map((issue) => issue.title);
    expect(titles).toContain("Create your Next.js app and see it in the browser");
    expect(titles).toContain("Put your website on the internet");
    expect(titles).toContain("Show a list of decks on the home screen");
    expect(titles).not.toContain("Build the card review flow");
  });

  it("groups every issue into one of the four fixed milestones", () => {
    const map = generateProjectMap(buildSpec(), flashcardApp);

    expect(map.milestones.map((milestone) => milestone.name)).toEqual([
      "Project setup",
      "Core flow working",
      "Feature complete",
      "Polish, README, demo",
    ]);

    const issuesInMilestones = map.milestones.flatMap((milestone) => milestone.issueTitles);
    expect(issuesInMilestones.sort()).toEqual(map.issues.map((issue) => issue.title).sort());
  });

  it("adds a shuffle-mode issue only when that feature is selected", () => {
    const withoutShuffle = generateProjectMap(
      buildSpec({ selectedFeatureIds: ["deck-list", "card-review"] }),
      flashcardApp
    );
    const withShuffle = generateProjectMap(
      buildSpec({ selectedFeatureIds: ["deck-list", "card-review", "shuffle-mode"] }),
      flashcardApp
    );

    expect(withoutShuffle.issues.some((issue) => issue.title.includes("shuffle"))).toBe(false);
    expect(withShuffle.issues.some((issue) => issue.title.includes("shuffle"))).toBe(true);
  });

  it("only generates a task split for team projects", () => {
    const solo = generateProjectMap(buildSpec({ teamMode: "solo" }), flashcardApp);
    const team = generateProjectMap(buildSpec({ teamMode: "team" }), flashcardApp);

    expect(solo.taskSplit).toBeUndefined();
    expect(team.taskSplit).toBeDefined();
    expect(team.taskSplit!.length).toBeGreaterThan(0);
  });

  it("includes a file tree with one route per selected screen", () => {
    const map = generateProjectMap(buildSpec(), flashcardApp);
    const appDir = map.fileTree.children?.find((child) => child.name === "app");

    expect(appDir).toBeDefined();
    expect(appDir?.type).toBe("dir");
  });

  it("maps a screen's route path to the right file per stack", () => {
    const web = generateProjectMap(buildSpec({ stack: "nextjs-web" }), flashcardApp);
    const expo = generateProjectMap(buildSpec({ stack: "expo-react-native" }), flashcardApp);

    const webReview = web.screens.find((screen) => screen.id === "review");
    const expoReview = expo.screens.find((screen) => screen.id === "review");

    expect(webReview?.routePath).toBe("/decks/[deckId]/review");
    expect(webReview?.routeFile).toBe("app/decks/[deckId]/review/page.tsx");
    expect(expoReview?.routeFile).toBe("app/decks/[deckId]/review/index.tsx");
  });
});
