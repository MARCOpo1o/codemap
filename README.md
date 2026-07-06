# CodeMap

CodeMap turns app ideas into structured project maps: screens, components, data models, GitHub issues, milestones, and README drafts.

## The problem

Going from "I have an app idea" to a project you can actually build and explain is harder than it sounds. Most builders know how to write code and use Git, but get stuck on the step before that: turning a vague idea into screens, components, data, and a plan of work. Most app builders optimize for speed or code generation. CodeMap optimizes for understanding while building.

## What it generates

Answer a short wizard — project name, target user, the problem you're solving, your experience level, and whether you're building solo or with a team — and CodeMap generates a **project map**:

- A project summary and problem statement
- Suggested screens and components
- Suggested data models
- A suggested file tree
- GitHub-ready issues, grouped into milestones
- A README draft
- Learning notes explaining the concepts each part of the project exercises
- A Getting Started walkthrough and plain-language glossary for anyone running a project like this for the first time
- An optional task split for team projects
- A downloadable, runnable Next.js starter project matching the map — real pages, components, and data models, not just a plan

Everything is cross-referenced: a screen points to the components it uses, an issue points to the concepts it teaches, a data model shows up everywhere it's used. It's meant to be read as a connected map, not a pile of separate lists.

## Two ways to start

- **Start from scratch**: name the "things" your app is about — a Deck, a Habit, an Event, a Recipe, whatever your idea needs — and pick what people should do with each one (see a list, view one in full, create one, edit or delete it, mark it done, see a count). CodeMap expands your choices into a full project map, including correctly nested routes when one thing belongs to another (a Card belonging to a Deck, an Exercise belonging to a Workout).
- **Start from a preset**: pick a ready-made category like **Flashcard App** or **Habit Tracker** and adjust its feature checklist. Presets are worked examples, not the only path — CodeMap doesn't limit you to a fixed list of project types.

## Demo flow

1. Pick a preset — for example, **Flashcard App** — or start from scratch and name your own things.
2. Describe the problem: "Biology students need a fast way to review vocabulary before exams."
3. Pick features (or things and blocks, if starting from scratch).
4. Pick your experience level.
5. Get a project map with screens, components, data models, a file tree, GitHub issues, milestones, a README draft, learning notes, and a downloadable starter project.

## Why project maps are useful

A project map gives you something to build *against* instead of a blank page. It's small enough to hold in your head, concrete enough to turn directly into GitHub issues, and it doesn't disappear once you start writing code — it's the plan you refer back to, and the first draft of the README you'll eventually publish.

## Quickstart

```bash
git clone https://github.com/<your-fork>/codemap.git
cd codemap
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Start a project map**, and answer the wizard.

CodeMap is deterministic — no AI, no account, no backend. Your answers and the last generated map are kept in your browser's local storage. Generated projects target Next.js (React + TypeScript): `npm install && npm run dev`, viewable in any browser.

## Example output

A trimmed example from the Flashcard App template:

```
## Screens
- Home — Entry point of the app; links to the deck list.
- Deck List — Shows every deck the user has created.
- Review — Shows one card at a time from the selected deck, front then back.

## Data models
- Deck — A named collection of flashcards.
- Card — A single flashcard belonging to a deck.
```

Plus a matching file tree, milestone-grouped GitHub issues, and a README draft — see the **README** and **Issues & Milestones** tabs in the app for the full generated output.

## Template system

A **template** describes a project category (Flashcard App, Habit Tracker, and so on) as a set of selectable features. Each feature declares the screens, components, data models, GitHub issues, and learning notes it contributes. The generator engine merges the features you select into one `ProjectMap` — the core object connecting all of it together.

Templates live in `src/templates/` and are plain TypeScript objects implementing the `ProjectTemplate` type from `src/core/types.ts`. Custom (start-from-scratch) projects go through the same `ProjectMap` pipeline: `src/core/blocks.ts` expands the things and building blocks you choose into the same feature shape a hand-authored template uses, so nothing downstream needs to know the difference. The generator engine (`src/core/`) has no UI dependencies, so it can be tested and reused independently of the web app.

## How to contribute a template

1. Copy `src/templates/flashcardApp.ts` as a starting point.
2. Rewrite its features, screens, components, data models, issues, and learning notes for your project category.
3. Register the template in `src/templates/index.ts`.
4. Add a test in `src/core/__tests__/` covering your template's generated output.
5. Open a pull request. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

You don't need to touch the UI to add a template — the wizard and project map view work with any registered `ProjectTemplate`.

## Roadmap

CodeMap's core idea — **idea → project map → buildable app** — stays fixed even as the implementation evolves. Planned directions:

- More building blocks and more preset templates
- A `gh`-friendly export for pushing issues and milestones directly to GitHub
- Shareable project map links
- Additional target stacks beyond Next.js
- Optional AI-assisted customization of a generated map (not required for the core experience)

## License

MIT
