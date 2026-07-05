import type {
  DataModelSpec,
  FeatureDef,
  ProjectSpec,
  ReadmeSpec,
  ScreenSpec,
  StackId,
} from "./types";

function gettingStartedFor(stack: StackId): string {
  if (stack === "expo-react-native") {
    return [
      "This project targets Expo (React Native + TypeScript).",
      "",
      "```bash",
      "npx create-expo-app@latest . --template",
      "npx expo start",
      "```",
      "",
      "Open the app in Expo Go, an iOS simulator, or an Android emulator.",
    ].join("\n");
  }
  return "Install dependencies and start the local dev server.";
}

export function generateReadme(
  spec: ProjectSpec,
  selectedFeatures: FeatureDef[],
  screens: ScreenSpec[],
  dataModels: DataModelSpec[]
): ReadmeSpec {
  const featureList = selectedFeatures
    .map((feature) => `- **${feature.label}** — ${feature.description}`)
    .join("\n");

  const screenList = screens
    .map((screen) => `- **${screen.name}** — ${screen.purpose}`)
    .join("\n");

  const modelList = dataModels
    .map((model) => `- **${model.name}** — ${model.description}`)
    .join("\n");

  return {
    title: spec.name,
    oneLiner: spec.problemStatement,
    sections: [
      { heading: "Problem", body: spec.problemStatement },
      { heading: "Who it's for", body: spec.targetUser },
      { heading: "Features", body: featureList || "_No features selected yet._" },
      { heading: "Screens", body: screenList || "_No screens yet._" },
      { heading: "Data models", body: modelList || "_No data models yet._" },
      { heading: "Getting started", body: gettingStartedFor(spec.stack) },
      {
        heading: "Roadmap",
        body: "- [ ] Add automated tests\n- [ ] Polish loading and empty states\n- [ ] Record a short demo",
      },
    ],
  };
}
