import { describe, expect, it } from "vitest";
import { buildCustomTemplate, buildFeaturesFromThings } from "@/core/blocks";
import { generateProjectMap } from "@/core/generateProjectMap";
import type { ProjectSpec, ThingSpec } from "@/core/types";
import { CUSTOM_TEMPLATE_ID } from "@/core/types";

const deck: ThingSpec = {
  id: "deck",
  name: "Deck",
  fields: [{ name: "title", type: "text" }],
  blockIds: ["list", "detail", "create"],
};

const card: ThingSpec = {
  id: "card",
  name: "Card",
  fields: [
    { name: "front", type: "text" },
    { name: "back", type: "text" },
  ],
  parentThingId: "deck",
  blockIds: ["list", "create", "toggle", "stats"],
};

describe("buildFeaturesFromThings", () => {
  it("nests a child thing's routes under its parent's detail route", () => {
    const features = buildFeaturesFromThings([deck, card]);

    const cardList = features.find((f) => f.id === "card-list")!;
    const cardListScreen = cardList.screens.find((s) => s.id === "card-list")!;
    expect(cardListScreen.routePath).toBe("/decks/[deckId]/cards");

    const cardCreate = features.find((f) => f.id === "card-create")!;
    const cardCreateScreen = cardCreate.screens.find((s) => s.id === "card-create")!;
    expect(cardCreateScreen.routePath).toBe("/decks/[deckId]/cards/new");

    const deckDetail = features.find((f) => f.id === "deck-detail")!;
    const deckDetailScreen = deckDetail.screens.find((s) => s.id === "deck-detail")!;
    expect(deckDetailScreen.routePath).toBe("/decks/[deckId]");
  });

  it("adds an isDone field to the data model only when toggle is selected", () => {
    const features = buildFeaturesFromThings([deck, card]);

    const cardModel = features.find((f) => f.id === "card-list")!.dataModels[0];
    const deckModel = features.find((f) => f.id === "deck-list")!.dataModels[0];

    expect(cardModel.fields.some((field) => field.name === "isDone")).toBe(true);
    expect(deckModel.fields.some((field) => field.name === "isDone")).toBe(false);
  });

  it("includes a parent foreign key field on the child's data model", () => {
    const features = buildFeaturesFromThings([deck, card]);
    const cardModel = features.find((f) => f.id === "card-list")!.dataModels[0];

    expect(cardModel.fields.some((field) => field.name === "deckId")).toBe(true);
  });

  it("only mentions counting done items in the stats issue when toggle is also selected", () => {
    const withToggle = buildFeaturesFromThings([card]).find((f) => f.id === "card-stats")!;
    const cardNoToggle: ThingSpec = { ...card, blockIds: ["list", "stats"] };
    const withoutToggle = buildFeaturesFromThings([cardNoToggle]).find(
      (f) => f.id === "card-stats"
    )!;

    expect(withToggle.issues[0].tasks.some((task) => task.includes("marked done"))).toBe(true);
    expect(withoutToggle.issues[0].tasks.some((task) => task.includes("marked done"))).toBe(false);
  });
});

describe("buildCustomTemplate + generateProjectMap round trip", () => {
  it("produces a valid ProjectMap from builder-defined things", () => {
    const template = buildCustomTemplate([deck, card]);
    const spec: ProjectSpec = {
      name: "My Study App",
      templateId: CUSTOM_TEMPLATE_ID,
      targetUser: "a student",
      problemStatement: "Reviewing vocabulary is tedious without a good tool.",
      experienceLevel: "developing",
      selectedFeatureIds: template.features.map((feature) => feature.id),
      teamMode: "solo",
      stack: "nextjs-web",
      things: [deck, card],
    };

    const map = generateProjectMap(spec, template);

    expect(map.screens.map((s) => s.name).sort()).toEqual(
      ["Deck Detail", "Decks List", "Cards List", "Create Deck", "Create Card"].sort()
    );
    expect(map.dataModels.map((m) => m.name).sort()).toEqual(["Card", "Deck"].sort());

    const issuesInMilestones = map.milestones.flatMap((milestone) => milestone.issueTitles);
    expect(issuesInMilestones.sort()).toEqual(map.issues.map((issue) => issue.title).sort());
  });
});
