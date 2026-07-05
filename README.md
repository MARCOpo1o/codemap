# CodeMap

CodeMap turns app ideas into structured project maps: screens, components, data models, GitHub issues, milestones, and README drafts.

## The problem

Going from "I have an app idea" to a project you can actually build and explain is harder than it sounds. Most builders know how to write code and use Git, but get stuck on the step before that: turning a vague idea into screens, components, data, and a plan of work. Most app builders optimize for speed or code generation. CodeMap optimizes for understanding while building.

## What it generates

Answer a short wizard — project name, category, target user, the problem you're solving, which features you want, your experience level, and whether you're building solo or with a team — and CodeMap generates a **project map**:

- A project summary and problem statement
- Suggested screens and components
- Suggested data models
- A suggested file tree
- GitHub-ready issues, grouped into milestones
- A README draft
- Learning notes explaining the concepts each part of the project exercises
- An optional task split for team projects

Everything is cross-referenced: a screen points to the components it uses, an issue points to the concepts it teaches, a data model shows up everywhere it's used. It's meant to be read as a connected map, not a pile of separate lists.

## Demo flow

1. Pick a template — for example, **Flashcard App**.
2. Describe the problem: "Biology students need a fast way to review vocabulary before exams."
3. Pick features: deck list, card review, create card, progress tracking.
4. Pick your experience level.
5. Get a project map with Home, Deck List, Review, and Create Card screens; DeckCard and FlashcardCard components; Deck and Card data models; a file tree; GitHub issues; milestones; a README draft; and learning notes.

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

CodeMap is deterministic and template-driven — no AI, no account, no backend. Your answers and the last generated map are kept in your browser's local storage.

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

Templates live in `src/templates/` and are plain TypeScript objects implementing the `ProjectTemplate` type from `src/core/types.ts`. The generator engine itself (`src/core/`) has no UI dependencies, so it can be tested and reused independently of the web app.

## How to contribute a template

1. Copy `src/templates/flashcardApp.ts` as a starting point.
2. Rewrite its features, screens, components, data models, issues, and learning notes for your project category.
3. Register the template in `src/templates/index.ts`.
4. Add a test in `src/core/__tests__/` covering your template's generated output.
5. Open a pull request. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

You don't need to touch the UI to add a template — the wizard and project map view work with any registered `ProjectTemplate`.

## Roadmap

CodeMap's core idea — **idea → project map → buildable app** — stays fixed even as the implementation evolves. Planned directions:

- More project templates and target stacks (web, CLI)
- Exporting a generated project as a ready-to-clone scaffold
- A `gh`-friendly export for pushing issues and milestones directly to GitHub
- Shareable project map links
- Optional AI-assisted customization of a generated map (not required for the core experience)

## License

MIT
