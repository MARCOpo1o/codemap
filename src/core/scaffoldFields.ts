import type { DataModelSpec, FieldDef } from "./types";

/** A fixed, deterministic "day one" timestamp used for seed data — no Date.now() in generated output. */
export const SEED_TIMESTAMP = "2026-01-01T00:00:00.000Z";

/** Map a FieldDef's free-text type label to a real TypeScript type. */
export function toTsType(fieldType: string): "string" | "number" | "boolean" {
  if (fieldType === "number") return "number";
  if (fieldType === "boolean") return "boolean";
  return "string";
}

/** A field named "<otherModelId>Id" is treated as a foreign key to that model. */
export function referencedModel(field: FieldDef, dataModels: DataModelSpec[]): DataModelSpec | undefined {
  const match = /^(.+)Id$/.exec(field.name);
  if (!match) return undefined;
  return dataModels.find((model) => model.id === match[1]);
}

/** Every other model with a field that points back at this one. */
export function childModelsOf(model: DataModelSpec, dataModels: DataModelSpec[]): DataModelSpec[] {
  return dataModels.filter((candidate) =>
    candidate.fields.some((field) => referencedModel(field, dataModels)?.id === model.id)
  );
}

/** The field a list/detail screen should show as an item's main label. */
export function primaryDisplayField(model: DataModelSpec, dataModels: DataModelSpec[]): FieldDef {
  const displayable = model.fields.find(
    (field) =>
      field.name !== "id" &&
      field.name !== "createdAt" &&
      field.name !== "isDone" &&
      !referencedModel(field, dataModels)
  );
  return displayable ?? model.fields[0];
}

/** A deterministic example value for a field, used to seed a first-run record. */
export function seedValueForField(
  model: DataModelSpec,
  field: FieldDef,
  dataModels: DataModelSpec[]
): string | number | boolean {
  if (field.name === "id") return `example-${model.id}-1`;
  if (field.name === "createdAt") return SEED_TIMESTAMP;

  const parent = referencedModel(field, dataModels);
  if (parent) return `example-${parent.id}-1`;

  switch (toTsType(field.type)) {
    case "number":
      return 0;
    case "boolean":
      return false;
    default:
      return `Example ${field.name}`;
  }
}
