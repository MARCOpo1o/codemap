import { pluralize, toKebabCase } from "./naming";
import { seedValueForField, toTsType } from "./scaffoldFields";
import type { DataModelSpec, ScaffoldFile } from "./types";

/** The localStorage key each model's records are stored under. */
export function storageKey(model: DataModelSpec): string {
  return toKebabCase(pluralize(model.name));
}

function tsInterfaceFor(model: DataModelSpec): string {
  const fields = model.fields
    .map((field) => `  ${field.name}: ${toTsType(field.type)}; // ${field.description}`)
    .join("\n");
  return `export interface ${model.name} {\n${fields}\n}`;
}

/** models/types.ts — one TypeScript interface per data model in the project. */
export function generateModelsFile(dataModels: DataModelSpec[]): ScaffoldFile {
  const header =
    "// TypeScript types for this app's data.\n" +
    "// Every screen and component that reads or saves data imports from here.\n\n";

  const body =
    dataModels.length > 0
      ? dataModels.map(tsInterfaceFor).join("\n\n")
      : "export {};\n// No data models yet — add a \"thing\" in CodeMap to generate one.";

  return { path: "models/types.ts", contents: `${header}${body}\n` };
}

/** lib/storage.ts — generic localStorage read/write, shared by every model. */
export function generateStorageFile(): ScaffoldFile {
  const contents = `// Small helpers for saving and loading data in the browser's localStorage.
// Every list/create/edit page in this project uses these two functions.

export function getAll<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  const raw = window.localStorage.getItem(key);
  if (raw) return JSON.parse(raw) as T[];
  // First time this key is read: save the seed data so it's there next time too.
  window.localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

export function saveAll<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}
`;
  return { path: "lib/storage.ts", contents };
}

function seedRecordFor(model: DataModelSpec, dataModels: DataModelSpec[]): string {
  const fields = model.fields
    .map((field) => `    ${field.name}: ${JSON.stringify(seedValueForField(model, field, dataModels))},`)
    .join("\n");
  return `{\n${fields}\n  }`;
}

/** lib/seedData.ts — one example record per model, so screens aren't empty on first run. */
export function generateSeedDataFile(dataModels: DataModelSpec[]): ScaffoldFile {
  if (dataModels.length === 0) {
    return { path: "lib/seedData.ts", contents: "export {};\n" };
  }

  const imports = `import type { ${dataModels.map((model) => model.name).join(", ")} } from "@/models/types";\n`;
  const exports = dataModels
    .map(
      (model) =>
        `export const seed${pluralize(model.name)}: ${model.name}[] = [\n  ${seedRecordFor(
          model,
          dataModels
        )},\n];`
    )
    .join("\n\n");

  return {
    path: "lib/seedData.ts",
    contents: `// One example record per data model, so your first run isn't a blank screen.\n// Feel free to edit or delete these once you're adding your own data.\n\n${imports}\n${exports}\n`,
  };
}
