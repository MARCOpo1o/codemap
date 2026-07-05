import type { GettingStartedSpec, ProjectSpec, StackId } from "./types";

function stepsFor(stack: StackId, projectName: string): GettingStartedSpec["steps"] {
  if (stack === "nextjs-web") {
    return [
      {
        title: "Install Node.js",
        body: "If you don't already have it, download Node.js from nodejs.org. It lets your computer run the project.",
      },
      {
        title: "Open a terminal in your project folder",
        body: "On Mac, right-click the folder and choose \"New Terminal at Folder\" (or open Terminal and `cd` into it). On Windows, open the folder and type `cmd` in the address bar.",
      },
      {
        title: "Install dependencies",
        body: "Run `npm install`. This downloads the code libraries your project depends on — you only need to do this once (and again if you add a new library later).",
      },
      {
        title: "Start the app",
        body: "Run `npm run dev`. This starts a local server on your own computer.",
      },
      {
        title: "Open it in your browser",
        body: `Go to http://localhost:3000. That's ${projectName || "your project"} running on your computer — nobody else can see it yet.`,
      },
      {
        title: "Make a small change",
        body: "Open app/page.tsx, change a line of text, and save the file. Your browser should update automatically without you refreshing — that's how you'll build the rest of the app: edit a file, save, look at the browser.",
      },
    ];
  }
  return [
    {
      title: "Install dependencies",
      body: "Run `npm install` in your project folder.",
    },
    {
      title: "Start the app",
      body: "Run the project's dev command and open it on a simulator or device.",
    },
  ];
}

const GLOSSARY: GettingStartedSpec["glossary"] = [
  {
    term: "Screen (or page)",
    definition:
      "One view in your app — like a screen in a mobile app or a page on a website. Each screen lives at its own URL and is written in its own file.",
  },
  {
    term: "Component",
    definition:
      "A reusable piece of UI, like a button or a card, that you build once and use on multiple screens.",
  },
  {
    term: "Data model",
    definition:
      "The shape of the information your app stores — what fields something has, like a Deck having a title and a list of cards.",
  },
  {
    term: "Route / URL",
    definition:
      "The web address for a screen, like /decks or /decks/3. In this project, the folder structure under app/ decides the URL.",
  },
  {
    term: "GitHub issue",
    definition:
      "A single task to do, with a checklist and a definition of \"done.\" Working through issues one at a time is how real teams build software.",
  },
  {
    term: "Milestone",
    definition: "A group of issues that together mark a real step forward, like \"core flow working.\"",
  },
];

export function generateGettingStarted(spec: ProjectSpec): GettingStartedSpec {
  return {
    steps: stepsFor(spec.stack, spec.name),
    glossary: GLOSSARY,
  };
}
