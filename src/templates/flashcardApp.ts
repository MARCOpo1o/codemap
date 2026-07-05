import type { ProjectTemplate } from "@/core/types";

/**
 * Flashcard App template.
 *
 * The reference implementation for the ProjectTemplate shape — every other
 * template follows this same pattern of feature-scoped screens, components,
 * data models, issues, and learning notes.
 */
export const flashcardApp: ProjectTemplate = {
  id: "flashcard-app",
  label: "Flashcard App",
  shortDescription: "Study decks of cards with spaced review.",
  description:
    "A deck-based flashcard app: create decks, add cards, and review them. Good for practicing lists, forms, and local data models.",
  exampleProblemStatement:
    "Biology students need a fast way to review vocabulary before exams.",
  exampleTargetUser: "A student studying for a class with a lot of new terms.",
  milestoneGoals: {
    setup: "Project runs locally with a home screen and navigation working.",
    core: "A user can create a deck and open it to see its cards.",
    features: "All selected features work end to end on a device or simulator.",
    polish: "README, screenshots, and a short demo are ready to share.",
  },
  features: [
    {
      id: "deck-list",
      label: "Deck list",
      description: "Home screen listing all of the user's decks.",
      core: true,
      screens: [
        {
          id: "home",
          name: "Home",
          purpose: "Entry point of the app; links to the deck list.",
          routePath: "/",
          componentIds: [],
        },
        {
          id: "deck-list",
          name: "Deck List",
          purpose: "Shows every deck the user has created.",
          routePath: "/decks",
          componentIds: ["deck-card"],
        },
      ],
      components: [
        {
          id: "deck-card",
          name: "DeckCard",
          description: "Displays a deck's name and card count in the deck list.",
          usedOnScreenIds: ["deck-list"],
          dataModelIds: ["deck"],
        },
      ],
      dataModels: [
        {
          id: "deck",
          name: "Deck",
          description: "A named collection of flashcards.",
          fields: [
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "title", type: "string", description: "Deck name shown to the user." },
            { name: "createdAt", type: "string", description: "ISO timestamp for sorting decks." },
          ],
        },
      ],
      issues: [
        {
          id: "issue-deck-list",
          title: "Show a list of decks on the home screen",
          summary: "Render every saved deck so the user can pick one to review or edit.",
          tasks: [
            "Define the Deck data model",
            "Load decks from local storage",
            "Render decks using the DeckCard component",
            "Handle the empty state (no decks yet)",
          ],
          acceptanceCriteria: [
            "Deck List screen shows one DeckCard per saved deck",
            "An empty deck list shows a friendly empty state instead of a blank screen",
          ],
          labels: ["feature"],
          milestoneId: "core",
          conceptIds: ["local-state-vs-persisted", "list-rendering"],
          guidance: {
            new: "Start by hardcoding an array of decks, get the list rendering, then swap it for stored data.",
          },
        },
      ],
      learningNotes: [
        {
          id: "list-rendering",
          concept: "Rendering lists of data",
          whyItMatters:
            "Most real apps are lists of things. Learning to map data into repeated components is one of the most reusable skills in app development.",
          appearsIn: { screenIds: ["deck-list"], componentIds: ["deck-card"] },
        },
      ],
    },
    {
      id: "card-review",
      label: "Card review",
      description: "Flip through a deck's cards one at a time.",
      core: true,
      screens: [
        {
          id: "review",
          name: "Review",
          purpose: "Shows one card at a time from the selected deck, front then back.",
          routePath: "/decks/[deckId]/review",
          componentIds: ["flashcard-card"],
        },
      ],
      components: [
        {
          id: "flashcard-card",
          name: "FlashcardCard",
          description: "Shows a single card's front or back and flips between them.",
          usedOnScreenIds: ["review"],
          dataModelIds: ["card"],
        },
      ],
      dataModels: [
        {
          id: "card",
          name: "Card",
          description: "A single flashcard belonging to a deck.",
          fields: [
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "deckId", type: "string", description: "The deck this card belongs to." },
            { name: "front", type: "string", description: "Prompt shown first." },
            { name: "back", type: "string", description: "Answer revealed on flip." },
          ],
        },
      ],
      issues: [
        {
          id: "issue-review-flow",
          title: "Build the card review flow",
          summary: "Let a user step through a deck's cards, flipping each one to see the answer.",
          tasks: [
            "Read the deckId route parameter",
            "Load that deck's cards",
            "Track which card index is currently shown",
            "Flip between front and back on tap",
            "Advance to the next card",
          ],
          acceptanceCriteria: [
            "Opening a deck's review screen shows its first card, front side",
            "Tapping the card reveals the back",
            "There is a way to move to the next card until the deck ends",
          ],
          labels: ["feature"],
          milestoneId: "core",
          dependsOnIssueIds: ["issue-deck-list"],
          conceptIds: ["navigation-params", "local-component-state"],
        },
      ],
      learningNotes: [
        {
          id: "navigation-params",
          concept: "Passing data between screens",
          whyItMatters:
            "Screens usually need to know which item they're showing. Reading an id from the route is how most apps carry that context across navigation.",
          appearsIn: { screenIds: ["review"], files: ["app/decks/[deckId]/review/page.tsx"] },
        },
        {
          id: "local-component-state",
          concept: "Local component state",
          whyItMatters:
            "Things like 'is this card flipped' or 'which index am I on' don't need to be saved permanently — they're a good first example of state that only matters while a screen is open.",
          appearsIn: { componentIds: ["flashcard-card"] },
        },
      ],
    },
    {
      id: "create-card",
      label: "Create & edit cards",
      description: "Add new cards to a deck, or a whole new deck.",
      core: true,
      screens: [
        {
          id: "create-deck",
          name: "Create Deck",
          purpose: "Form to name and create a new deck.",
          routePath: "/decks/new",
          componentIds: [],
        },
        {
          id: "create-card",
          name: "Create Card",
          purpose: "Form to add a front/back card to a deck.",
          routePath: "/decks/[deckId]/new-card",
          componentIds: [],
        },
      ],
      components: [],
      dataModels: [],
      issues: [
        {
          id: "issue-create-deck",
          title: "Create a new deck",
          summary: "Let a user name a deck and save it before adding any cards.",
          tasks: [
            "Build a form with a title input",
            "Validate that the title isn't empty",
            "Save the new deck to storage",
            "Navigate back to the deck list",
          ],
          acceptanceCriteria: [
            "Submitting a valid title creates a deck and returns to the deck list",
            "An empty title shows a validation message instead of saving",
          ],
          labels: ["feature"],
          milestoneId: "features",
          dependsOnIssueIds: ["issue-deck-list"],
          conceptIds: ["form-validation"],
        },
        {
          id: "issue-create-card",
          title: "Add cards to a deck",
          summary: "Let a user add front/back cards to an existing deck.",
          tasks: [
            "Build a form with front and back inputs",
            "Save the new card, linked to its deck",
            "Return to the deck (or stay to add another card)",
          ],
          acceptanceCriteria: [
            "A saved card appears in that deck's review flow",
            "The form clears after a successful save",
          ],
          labels: ["feature"],
          milestoneId: "features",
          dependsOnIssueIds: ["issue-review-flow"],
          conceptIds: ["form-validation"],
        },
      ],
      learningNotes: [
        {
          id: "form-validation",
          concept: "Validating user input",
          whyItMatters:
            "Almost every app has a form somewhere. Deciding what counts as valid input, and giving clear feedback when it isn't, is a core product and engineering skill.",
          appearsIn: { screenIds: ["create-deck", "create-card"] },
        },
      ],
    },
    {
      id: "progress-tracking",
      label: "Progress tracking",
      description: "Track how many cards in a deck have been reviewed.",
      screens: [],
      components: [
        {
          id: "progress-bar",
          name: "ProgressBar",
          description: "Shows how far through the current deck the user is.",
          usedOnScreenIds: ["review"],
          dataModelIds: [],
        },
      ],
      dataModels: [],
      issues: [
        {
          id: "issue-progress-tracking",
          title: "Show review progress within a deck",
          summary: "Give the user a sense of how many cards are left in the current session.",
          tasks: [
            "Track the current card index against the deck's total card count",
            "Render a ProgressBar on the Review screen",
          ],
          acceptanceCriteria: [
            "The progress indicator updates as the user advances through cards",
          ],
          labels: ["enhancement"],
          milestoneId: "features",
          dependsOnIssueIds: ["issue-review-flow"],
          conceptIds: ["deriving-state"],
        },
      ],
      learningNotes: [
        {
          id: "deriving-state",
          concept: "Deriving values instead of storing them",
          whyItMatters:
            "Progress can be calculated from the current index and total count rather than tracked separately — a useful habit that avoids state going out of sync.",
          appearsIn: { componentIds: ["progress-bar"] },
        },
      ],
    },
    {
      id: "shuffle-mode",
      label: "Shuffle mode",
      description: "Review a deck's cards in random order.",
      screens: [],
      components: [],
      dataModels: [],
      issues: [
        {
          id: "issue-shuffle-mode",
          title: "Add a shuffle option to review sessions",
          summary: "Let a user review a deck's cards in a randomized order instead of the saved order.",
          tasks: [
            "Add a shuffle toggle before starting a review session",
            "Randomize card order without mutating the saved deck",
          ],
          acceptanceCriteria: [
            "Turning shuffle on changes the order cards appear in",
            "The deck's original card order is unaffected afterward",
          ],
          labels: ["enhancement"],
          milestoneId: "features",
          dependsOnIssueIds: ["issue-review-flow"],
          conceptIds: ["pure-functions"],
        },
      ],
      learningNotes: [
        {
          id: "pure-functions",
          concept: "Not mutating the original data",
          whyItMatters:
            "Shuffling a copy of the array (instead of the original) prevents subtle bugs where unrelated parts of the app see reordered data unexpectedly.",
          appearsIn: { files: ["lib/shuffle.ts"] },
        },
      ],
    },
  ],
};
