import { toKebabCase } from "./naming";
import type { ComponentSpec, DataModelSpec, FileNode, ScreenSpec, StackId } from "./types";

function explainRouteSegment(segment: string): string {
  if (segment.startsWith("[") && segment.endsWith("]")) {
    const param = segment.slice(1, -1);
    return `Dynamic route segment: the ${param} in the URL fills in this part.`;
  }
  return `This folder becomes "/${segment}" in the URL.`;
}

function insertFile(root: FileNode, path: string, explanation: string): void {
  const segments = path.split("/");
  let current = root;

  segments.forEach((segment, index) => {
    const isLeaf = index === segments.length - 1;
    current.children ??= [];
    let next = current.children.find((child) => child.name === segment);

    if (!next) {
      next = {
        name: segment,
        type: isLeaf ? "file" : "dir",
        explanation: isLeaf ? explanation : explainRouteSegment(segment),
        children: isLeaf ? undefined : [],
      };
      current.children.push(next);
    }

    current = next;
  });
}

/**
 * Build the suggested file tree: one route file per screen, one component
 * file per component, a shared types file for data models, and a small
 * storage helper. Layout and explanations adapt to the target stack.
 */
export function generateFileTree(
  projectName: string,
  screens: ScreenSpec[],
  components: ComponentSpec[],
  dataModels: DataModelSpec[],
  stack: StackId
): FileNode {
  const isWeb = stack === "nextjs-web";

  const appDir: FileNode = {
    name: "app",
    type: "dir",
    explanation: isWeb
      ? "Your pages. Each folder in here becomes part of the website's URL, and page.tsx is what shows at that URL."
      : "Screens and navigation, following Expo Router file-based routing.",
    children: [],
  };

  if (isWeb) {
    appDir.children!.push(
      {
        name: "layout.tsx",
        type: "file",
        explanation: "Wraps every page. Shared navigation and the site title live here.",
      },
      {
        name: "globals.css",
        type: "file",
        explanation: "Styles that apply to the whole site.",
      }
    );
  }

  for (const screen of screens) {
    // routeFile starts with "app/"; insert the remainder into the app dir.
    const pathInApp = screen.routeFile.replace(/^app\//, "");
    insertFile(
      appDir,
      pathInApp,
      `${screen.name} — ${screen.purpose}${isWeb ? ` Shown at ${screen.routePath}` : ""}`
    );
  }

  const componentsDir: FileNode = {
    name: "components",
    type: "dir",
    explanation: "Reusable pieces of UI shared across pages.",
    children: components.map((component) => ({
      name: `${component.name}.tsx`,
      type: "file",
      explanation: component.description,
    })),
  };

  const modelsDir: FileNode = {
    name: "models",
    type: "dir",
    explanation: "Shared TypeScript types for the app's data.",
    children: [
      {
        name: "types.ts",
        type: "file",
        explanation:
          dataModels.length > 0
            ? `TypeScript interfaces for: ${dataModels.map((model) => model.name).join(", ")}.`
            : "TypeScript interfaces for the app's data models.",
      },
    ],
  };

  const libDir: FileNode = {
    name: "lib",
    type: "dir",
    explanation: "Small helper modules used across the app.",
    children: [
      {
        name: "storage.ts",
        type: "file",
        explanation: isWeb
          ? "Helpers for saving and loading your app's data in the browser's localStorage."
          : "Helpers for reading and writing app data to local device storage.",
      },
    ],
  };

  return {
    name: toKebabCase(projectName),
    type: "dir",
    explanation: "Project root.",
    children: [
      appDir,
      componentsDir,
      modelsDir,
      libDir,
      {
        name: "README.md",
        type: "file",
        explanation: "Project overview, setup instructions, and feature list.",
      },
    ],
  };
}
