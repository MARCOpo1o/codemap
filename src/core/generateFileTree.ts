import type { ComponentSpec, DataModelSpec, FileNode, ScreenSpec } from "./types";

function toKebabCase(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "my-app";
}

function explainRouteSegment(segment: string): string {
  if (segment.startsWith("[") && segment.endsWith("]")) {
    const param = segment.slice(1, -1);
    return `Dynamic route parameter: ${param}.`;
  }
  return `Groups the routes related to "${segment}".`;
}

function insertRouteFile(root: FileNode, routeFile: string, explanation: string): void {
  const segments = routeFile.split("/");
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
 * Build the suggested file tree for an Expo Router + TypeScript project:
 * one route file per screen, one component file per component, a shared
 * types file for data models, and a small storage helper.
 */
export function generateFileTree(
  projectName: string,
  screens: ScreenSpec[],
  components: ComponentSpec[],
  dataModels: DataModelSpec[]
): FileNode {
  const appDir: FileNode = {
    name: "app",
    type: "dir",
    explanation: "Screens and navigation, following Expo Router file-based routing.",
    children: [],
  };

  for (const screen of screens) {
    insertRouteFile(appDir, screen.routeFile, `${screen.name} screen: ${screen.purpose}`);
  }

  const componentsDir: FileNode = {
    name: "components",
    type: "dir",
    explanation: "Reusable pieces of UI shared across screens.",
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
        explanation: "Helpers for reading and writing app data to local device storage.",
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
