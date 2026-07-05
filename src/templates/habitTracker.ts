import type { ProjectTemplate } from "@/core/types";

export const habitTracker: ProjectTemplate = {
  id: "habit-tracker",
  label: "Habit Tracker",
  shortDescription: "Log daily habits and see your streaks.",
  description:
    "A habit tracker: log habits, mark them done each day, and see how consistent you've been.",
  exampleProblemStatement:
    "People trying to build a new habit forget to track it consistently, so they lose sight of their progress.",
  exampleTargetUser: "Someone trying to build a daily habit, like exercise or reading.",
  milestoneGoals: {
    setup: "Project runs locally with a home screen and navigation working.",
    core: "A user can create a habit and mark it done for today.",
    features: "All selected features work end to end on a device or simulator.",
    polish: "README, screenshots, and a short demo are ready to share.",
  },
  features: [
    {
      id: "habit-list",
      label: "Habit list",
      description: "Home screen listing all of the user's habits.",
      core: true,
      screens: [
        {
          id: "home",
          name: "Home",
          purpose: "Entry point of the app; shows today's habits.",
          routeFile: "index.tsx",
          componentIds: ["habit-card"],
        },
      ],
      components: [
        {
          id: "habit-card",
          name: "HabitCard",
          description: "Displays a habit's name and whether it's done for today.",
          usedOnScreenIds: ["home"],
          dataModelIds: ["habit"],
        },
      ],
      dataModels: [
        {
          id: "habit",
          name: "Habit",
          description: "A habit the user is tracking.",
          fields: [
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "name", type: "string", description: "Habit name shown to the user." },
            { name: "createdAt", type: "string", description: "ISO timestamp for sorting habits." },
          ],
        },
      ],
      issues: [
        {
          id: "issue-habit-list",
          title: "Show a list of habits on the home screen",
          summary: "Render every saved habit so the user can see what they're tracking.",
          tasks: [
            "Define the Habit data model",
            "Load habits from local storage",
            "Render habits using the HabitCard component",
            "Handle the empty state (no habits yet)",
          ],
          acceptanceCriteria: [
            "Home screen shows one HabitCard per saved habit",
            "An empty habit list shows a friendly empty state instead of a blank screen",
          ],
          labels: ["feature"],
          milestoneId: "core",
          conceptIds: ["list-rendering"],
          guidance: {
            new: "Start by hardcoding an array of habits, get the list rendering, then swap it for stored data.",
          },
        },
      ],
      learningNotes: [
        {
          id: "list-rendering",
          concept: "Rendering lists of data",
          whyItMatters:
            "Most real apps are lists of things. Learning to map data into repeated components is one of the most reusable skills in app development.",
          appearsIn: { screenIds: ["home"], componentIds: ["habit-card"] },
        },
      ],
    },
    {
      id: "log-completion",
      label: "Log completion",
      description: "Mark a habit as done for today.",
      core: true,
      screens: [],
      components: [
        {
          id: "complete-toggle",
          name: "CompleteToggle",
          description: "A button on a HabitCard that marks the habit done for today.",
          usedOnScreenIds: ["home"],
          dataModelIds: ["completion"],
        },
      ],
      dataModels: [
        {
          id: "completion",
          name: "Completion",
          description: "A record that a habit was completed on a given date.",
          fields: [
            { name: "id", type: "string", description: "Unique identifier." },
            { name: "habitId", type: "string", description: "The habit this completion belongs to." },
            { name: "date", type: "string", description: "The date (YYYY-MM-DD) the habit was completed." },
          ],
        },
      ],
      issues: [
        {
          id: "issue-log-completion",
          title: "Mark a habit done for today",
          summary: "Let a user tap a habit to log that they completed it today.",
          tasks: [
            "Save a Completion record for the habit and today's date when tapped",
            "Show a visual difference on HabitCard once a habit is done for today",
            "Prevent logging the same habit twice in one day",
          ],
          acceptanceCriteria: [
            "Tapping an incomplete habit marks it done for today",
            "A habit already completed today shows as done without creating a duplicate record",
          ],
          labels: ["feature"],
          milestoneId: "core",
          dependsOnIssueIds: ["issue-habit-list"],
          conceptIds: ["local-dates"],
        },
      ],
      learningNotes: [
        {
          id: "local-dates",
          concept: "Working with dates as plain data",
          whyItMatters:
            "Storing a date as a simple YYYY-MM-DD string keeps comparisons (like 'is this today?') straightforward, and avoids timezone bugs that come from storing full timestamps for calendar-day logic.",
          appearsIn: { componentIds: ["complete-toggle"] },
        },
      ],
    },
    {
      id: "create-habit",
      label: "Create a habit",
      description: "Add a new habit to track.",
      core: true,
      screens: [
        {
          id: "create-habit",
          name: "Create Habit",
          purpose: "Form to name and create a new habit.",
          routeFile: "habits/new.tsx",
          componentIds: [],
        },
      ],
      components: [],
      dataModels: [],
      issues: [
        {
          id: "issue-create-habit",
          title: "Create a new habit",
          summary: "Let a user name a habit and save it before tracking any completions.",
          tasks: [
            "Build a form with a name input",
            "Validate that the name isn't empty",
            "Save the new habit to storage",
            "Navigate back to the home screen",
          ],
          acceptanceCriteria: [
            "Submitting a valid name creates a habit and returns to the home screen",
            "An empty name shows a validation message instead of saving",
          ],
          labels: ["feature"],
          milestoneId: "features",
          dependsOnIssueIds: ["issue-habit-list"],
          conceptIds: ["form-validation"],
        },
      ],
      learningNotes: [
        {
          id: "form-validation",
          concept: "Validating user input",
          whyItMatters:
            "Almost every app has a form somewhere. Deciding what counts as valid input, and giving clear feedback when it isn't, is a core product and engineering skill.",
          appearsIn: { screenIds: ["create-habit"] },
        },
      ],
    },
    {
      id: "streaks",
      label: "Streaks",
      description: "Show how many days in a row a habit has been completed.",
      screens: [],
      components: [
        {
          id: "streak-badge",
          name: "StreakBadge",
          description: "Shows a habit's current streak on its HabitCard.",
          usedOnScreenIds: ["home"],
          dataModelIds: ["completion"],
        },
      ],
      dataModels: [],
      issues: [
        {
          id: "issue-streaks",
          title: "Calculate and show each habit's current streak",
          summary: "Give the user a sense of how consistent they've been with each habit.",
          tasks: [
            "Write a function that counts consecutive completed days ending today or yesterday",
            "Render the streak count on StreakBadge",
          ],
          acceptanceCriteria: [
            "A habit completed every day this week shows a streak equal to that count",
            "Missing a day resets the streak to zero",
          ],
          labels: ["enhancement"],
          milestoneId: "features",
          dependsOnIssueIds: ["issue-log-completion"],
          conceptIds: ["deriving-state"],
        },
      ],
      learningNotes: [
        {
          id: "deriving-state",
          concept: "Deriving values instead of storing them",
          whyItMatters:
            "A streak can be calculated from a habit's completion history rather than tracked as its own field — a useful habit that avoids state going out of sync.",
          appearsIn: { componentIds: ["streak-badge"] },
        },
      ],
    },
    {
      id: "reminders",
      label: "Reminders",
      description: "Remind the user to complete a habit later in the day.",
      screens: [],
      components: [],
      dataModels: [],
      issues: [
        {
          id: "issue-reminders",
          title: "Add a daily reminder for incomplete habits",
          summary: "Prompt the user with a local notification if a habit isn't done yet.",
          tasks: [
            "Request notification permission from the user",
            "Schedule a local notification for habits not yet completed today",
            "Cancel the reminder once the habit is marked done",
          ],
          acceptanceCriteria: [
            "The app requests permission before scheduling any notification",
            "Marking a habit done cancels its pending reminder",
          ],
          labels: ["enhancement"],
          milestoneId: "features",
          dependsOnIssueIds: ["issue-log-completion"],
          conceptIds: ["permissions"],
        },
      ],
      learningNotes: [
        {
          id: "permissions",
          concept: "Asking for device permissions",
          whyItMatters:
            "Features like notifications require explicit user permission on both iOS and Android. Handling the 'denied' case gracefully is part of building the feature, not an afterthought.",
          appearsIn: { files: ["lib/notifications.ts"] },
        },
      ],
    },
  ],
};
