# Contributing to CodeMap

Thanks for considering a contribution. This project is intentionally small: a
deterministic generator engine plus a wizard UI. Most contributions fall into
one of three buckets — a new project template, an improvement to an existing
template's generated content, or a change to the engine or UI itself.

## Project structure

```
src/
  app/            Next.js pages (landing page, /builder)
  components/
    wizard/       The multi-step ProjectWizard form
    map/          Panels that render a generated ProjectMap
    ui/           shadcn/ui primitives
  core/           The generator engine — plain TypeScript, no UI imports
    blocks.ts     Expands builder-defined things + blocks into features
                  (the "start from scratch" path)
    scaffold*.ts  Generate a real, runnable project from a ProjectMap
  templates/      ProjectTemplate definitions, one file per preset category
```

The engine (`src/core/`) and the UI (`src/app/`, `src/components/`) are
deliberately separate. The engine should never import from React or Next.js —
that's what makes it independently testable and reusable outside the web app.

## Development setup

```bash
npm install
npm run dev      # start the app at http://localhost:3000
npm run test     # run the generator engine's unit tests
npm run build    # production build
```

Node 20+ is required (see `.nvmrc`).

## Adding a project template

Templates are the main way to extend CodeMap. Each one describes a project
category (Flashcard App, Habit Tracker, and so on) as a set of selectable
features.

1. Copy `src/templates/flashcardApp.ts` to a new file, e.g. `src/templates/habitTracker.ts`.
2. Fill in the `ProjectTemplate` fields:
   - `id`, `label`, `shortDescription`, `description`
   - `exampleProblemStatement` and `exampleTargetUser` — shown as wizard placeholders
   - `milestoneGoals` — one goal sentence per fixed milestone stage (`setup`, `core`, `features`, `polish`)
   - `features` — the selectable building blocks of the category
3. For each feature, define:
   - `screens` — with a `routePath` (the URL it lives at, e.g. `/decks/[deckId]/review`); the engine derives the actual file per target stack
   - `components`
   - `dataModels`
   - `issues` — each with `tasks`, `acceptanceCriteria`, and optionally `conceptIds` linking to that feature's learning notes
   - `learningNotes` — the concepts worth understanding while building this feature
4. Register the template in `src/templates/index.ts`.
5. Add a test in `src/core/__tests__/` that generates a `ProjectMap` from your
   template and checks the parts you care about (see
   `generateProjectMap.test.ts` for examples).
6. Run `npm run test` and `npm run build`.

Mark a feature `core: true` if it should be pre-selected by default — this
should be the minimum feature set needed for a working first version of that
project type.

## Adding or improving a building block

The "start from scratch" path doesn't use templates — a builder names their
own things (nouns like Deck, Habit, Event) and picks building blocks (list,
detail, create, edit & delete, mark done, stats). Each `(thing, block)` pair
is expanded into a `FeatureDef` by `src/core/blocks.ts`, so it flows through
the same `generateProjectMap` pipeline a template does. Also see
`src/core/scaffoldPages.ts`, which classifies a screen by name (does it end
in " List", start with "Create ", and so on) and generates a real, runnable
page for it — a new block should keep that naming convention if you want the
scaffold generator to produce real code for it, rather than a generic
TODO-commented placeholder.

## Improving generated content

If an existing template's issue wording, learning notes, or file tree
explanations could be clearer or more accurate, that's a welcome contribution
on its own — you don't need to add a new template to help here. Keep
explanations plain-language and specific; avoid restating what the code
already makes obvious.

## Engine or UI changes

Sub-generators in `src/core/` (`generateScreens.ts`, `generateIssues.ts`, and
so on) are pure functions: they take the selected features (and sometimes the
spec) and return part of the `ProjectMap`. `generateProjectMap.ts` is the
orchestrator that calls them in order. If you're changing behavior shared
across templates, it likely belongs in one of these files rather than in a
specific template.

UI components under `src/components/map/` are one panel per `ProjectMap`
section and take already-generated data as props — they shouldn't contain
generation logic themselves.

## Pull requests

- Keep PRs focused: one template, one bug fix, or one feature per PR.
- Include or update a test when changing `src/core/`.
- Run `npm run test` and `npm run build` before opening the PR.
- Describe what changed and why in the PR description.
