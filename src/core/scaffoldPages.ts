import { pluralize } from "./naming";
import { storageKey } from "./scaffoldData";
import {
  childModelsOf,
  primaryDisplayField,
  referencedModel,
  seedValueForField,
  toTsType,
} from "./scaffoldFields";
import type { ComponentSpec, DataModelSpec, FieldDef, ScaffoldFile, ScreenSpec } from "./types";

type ScreenKind = "list" | "detail" | "create" | "edit" | "generic";

function classifyScreen(screen: ScreenSpec): ScreenKind {
  const name = screen.name.toLowerCase();
  if (name.startsWith("create ")) return "create";
  if (name.startsWith("edit ")) return "edit";
  if (name.endsWith(" list")) return "list";
  if (name.endsWith(" detail")) return "detail";
  return "generic";
}

/** The model a screen is about: via its display component if it has one, else by matching the screen's name against a model's singular/plural name. */
function findModelForScreen(
  screen: ScreenSpec,
  components: ComponentSpec[],
  dataModels: DataModelSpec[]
): DataModelSpec | undefined {
  for (const componentId of screen.componentIds) {
    const component = components.find((c) => c.id === componentId);
    if (component && component.dataModelIds.length === 1) {
      const model = dataModels.find((m) => m.id === component.dataModelIds[0]);
      if (model) return model;
    }
  }

  const cleaned = screen.name
    .replace(/^Create |^Edit /, "")
    .replace(/\s+List$|\s+Detail$/, "")
    .trim()
    .toLowerCase();

  return dataModels.find(
    (model) => cleaned === model.name.toLowerCase() || cleaned === pluralize(model.name).toLowerCase()
  );
}

interface ScreensForModel {
  list?: ScreenSpec;
  detail?: ScreenSpec;
  create?: ScreenSpec;
  edit?: ScreenSpec;
}

/** Cross-reference: for a given model, which screen (if any) is its list/detail/create/edit view. */
function buildScreenIndex(
  screens: ScreenSpec[],
  components: ComponentSpec[],
  dataModels: DataModelSpec[]
): Map<string, ScreensForModel> {
  const index = new Map<string, ScreensForModel>();

  for (const screen of screens) {
    const kind = classifyScreen(screen);
    if (kind === "generic") continue;
    const model = findModelForScreen(screen, components, dataModels);
    if (!model) continue;
    const entry = index.get(model.id) ?? {};
    entry[kind] = screen;
    index.set(model.id, entry);
  }

  return index;
}

function dynamicSegments(routePath: string): string[] {
  return routePath
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment.startsWith("[") && segment.endsWith("]"))
    .map((segment) => segment.slice(1, -1));
}

function pageFunctionName(screenName: string, suffix: string): string {
  const cleaned = screenName.replace(/[^a-zA-Z0-9]/g, "");
  return `${cleaned}${suffix}`;
}

/** Build a template-literal href string (as source code) from a route path, substituting `idExpr` for the last dynamic segment and referencing `params.x` for any earlier ones. */
function hrefTemplate(routePath: string, idExpr: string): string {
  const segments = routePath.split("/").filter(Boolean);
  const rendered = segments.map((segment, index) => {
    const isDynamic = segment.startsWith("[") && segment.endsWith("]");
    if (!isDynamic) return segment;
    const isLast = index === segments.length - 1;
    return isLast ? "${" + idExpr + "}" : "${params." + segment.slice(1, -1) + "}";
  });
  return "`/" + rendered.join("/") + "`";
}

function htmlInputType(fieldType: string): "text" | "number" | "checkbox" | "date" {
  if (fieldType === "number") return "number";
  if (fieldType === "boolean") return "checkbox";
  if (fieldType === "string (date)") return "date";
  return "text";
}

/** Fields a create/edit form should collect from the user (not id/createdAt/isDone, and not a foreign key supplied by the URL). */
function formFields(model: DataModelSpec, routeParamNames: string[]): FieldDef[] {
  return model.fields.filter(
    (field) =>
      field.name !== "id" &&
      field.name !== "createdAt" &&
      field.name !== "isDone" &&
      !routeParamNames.includes(field.name)
  );
}

function paramsDeclaration(routePath: string): string {
  const segments = dynamicSegments(routePath);
  if (segments.length === 0) return "";
  const shape = segments.map((name) => `${name}: string`).join("; ");
  return `  const params = useParams<{ ${shape} }>();\n`;
}

function generateListPage(
  screen: ScreenSpec,
  model: DataModelSpec,
  index: Map<string, ScreensForModel>,
  dataModels: DataModelSpec[]
): ScaffoldFile {
  const key = storageKey(model);
  const seedName = `seed${pluralize(model.name)}`;
  const display = primaryDisplayField(model, dataModels).name;
  const entry = index.get(model.id);
  const routeParams = dynamicSegments(screen.routePath);
  const fnName = pageFunctionName(screen.name, "Page");

  const scopeField = routeParams
    .map((param) => model.fields.find((field) => field.name === param))
    .find((field): field is FieldDef => Boolean(field));
  const filterLine = scopeField
    ? `\n      .filter((item) => item.${scopeField.name} === params.${scopeField.name})`
    : "";

  const detailScreen = entry?.detail;
  const createScreen = entry?.create;

  const itemLink = detailScreen
    ? `<Link href={${hrefTemplate(detailScreen.routePath, "item.id")}}>{item.${display}}</Link>`
    : `<span>{item.${display}}</span>`;

  const newLink = createScreen
    ? `<Link href={${hrefTemplate(createScreen.routePath, "")}} className="new-link">+ New ${model.name}</Link>`
    : "";

  const contents = `"use client";
// ${screen.name} — ${screen.purpose}
// Shown at ${screen.routePath}. Edit this file to change what this page does.

import { useEffect, useState } from "react";
import Link from "next/link";
${routeParams.length > 0 ? 'import { useParams } from "next/navigation";\n' : ""}import { getAll } from "@/lib/storage";
import { ${seedName} } from "@/lib/seedData";
import type { ${model.name} } from "@/models/types";

export default function ${fnName}() {
${paramsDeclaration(screen.routePath)}  const [items, setItems] = useState<${model.name}[]>([]);

  useEffect(() => {
    setItems(
      getAll<${model.name}>("${key}", ${seedName})${filterLine}
    );
  }, []);

  return (
    <main>
      <h1>${screen.name}</h1>
      ${newLink}
      {items.length === 0 ? (
        <p>No ${pluralize(model.name).toLowerCase()} yet.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>${itemLink}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
`;

  return { path: screen.routeFile, contents };
}

function generateDetailPage(
  screen: ScreenSpec,
  model: DataModelSpec,
  index: Map<string, ScreensForModel>,
  dataModels: DataModelSpec[]
): ScaffoldFile {
  const key = storageKey(model);
  const seedName = `seed${pluralize(model.name)}`;
  const routeParams = dynamicSegments(screen.routePath);
  const ownIdParam = routeParams[routeParams.length - 1];
  const fnName = pageFunctionName(screen.name, "Page");
  const entry = index.get(model.id);
  const children = childModelsOf(model, dataModels);

  const fieldLines = model.fields
    .filter((field) => field.name !== "id" && !referencedModel(field, dataModels))
    .map((field) => `        <p><strong>${field.name}:</strong> {String(item.${field.name})}</p>`)
    .join("\n");

  const editLink = entry?.edit
    ? `      <Link href={${hrefTemplate(entry.edit.routePath, `params.${ownIdParam}`)}}>Edit</Link>`
    : "";

  const childLinks = children
    .map((child) => {
      const childList = index.get(child.id)?.list;
      if (!childList) return "";
      return `      <Link href={${hrefTemplate(childList.routePath, `params.${ownIdParam}`)}}>View ${pluralize(
        child.name
      )}</Link>`;
    })
    .filter(Boolean)
    .join("\n");

  const extraLinks = [editLink, childLinks].filter(Boolean).join("\n");

  const contents = `"use client";
// ${screen.name} — ${screen.purpose}
// Shown at ${screen.routePath}. Edit this file to change what this page does.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAll } from "@/lib/storage";
import { ${seedName} } from "@/lib/seedData";
import type { ${model.name} } from "@/models/types";

export default function ${fnName}() {
${paramsDeclaration(screen.routePath)}  const [item, setItem] = useState<${model.name} | undefined>();

  useEffect(() => {
    const all = getAll<${model.name}>("${key}", ${seedName});
    setItem(all.find((candidate) => candidate.id === params.${ownIdParam}));
  }, [params.${ownIdParam}]);

  if (!item) return <main><p>Loading...</p></main>;

  return (
    <main>
      <h1>${model.name} detail</h1>
${fieldLines}
${extraLinks}
    </main>
  );
}
`;

  return { path: screen.routeFile, contents };
}

function generateCreatePage(screen: ScreenSpec, model: DataModelSpec, dataModels: DataModelSpec[]): ScaffoldFile {
  const key = storageKey(model);
  const routeParams = dynamicSegments(screen.routePath);
  const fields = formFields(model, routeParams);
  const fnName = pageFunctionName(screen.name, "Page");

  const stateInit = fields
    .map((field) => `${field.name}: ${htmlInputType(field.type) === "checkbox" ? "false" : htmlInputType(field.type) === "number" ? "0" : '""'}`)
    .join(", ");

  const inputs = fields
    .map((field) => {
      const type = htmlInputType(field.type);
      if (type === "checkbox") {
        return `        <label>
          ${field.name}
          <input
            type="checkbox"
            checked={form.${field.name}}
            onChange={(e) => setForm({ ...form, ${field.name}: e.target.checked })}
          />
        </label>`;
      }
      const valueExpr = type === "number" ? "Number(e.target.value)" : "e.target.value";
      return `        <label>
          ${field.name}
          <input
            type="${type}"
            value={form.${field.name}}
            onChange={(e) => setForm({ ...form, ${field.name}: ${valueExpr} })}
          />
        </label>`;
    })
    .join("\n");

  const formFieldNames = new Set(fields.map((field) => field.name));
  const otherFields = model.fields.filter(
    (field) => field.name !== "id" && !formFieldNames.has(field.name)
  );
  const otherAssignments = otherFields
    .map((field) => {
      if (routeParams.includes(field.name)) return `      ${field.name}: params.${field.name},`;
      if (field.name === "createdAt") return `      createdAt: new Date().toISOString(),`;
      if (field.name === "isDone") return `      isDone: false,`;
      return `      ${field.name}: ${JSON.stringify(seedValueForField(model, field, dataModels))},`;
    })
    .join("\n");
  const extraAssignments = otherAssignments ? `\n${otherAssignments}` : "";

  const contents = `"use client";
// ${screen.name} — ${screen.purpose}
// Shown at ${screen.routePath}. Edit this file to change what this page does.

import { useState } from "react";
import { useRouter${routeParams.length > 0 ? ", useParams" : ""} } from "next/navigation";
import { getAll, saveAll } from "@/lib/storage";
import type { ${model.name} } from "@/models/types";

export default function ${fnName}() {
  const router = useRouter();
${paramsDeclaration(screen.routePath)}  const [form, setForm] = useState({ ${stateInit} });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const existing = getAll<${model.name}>("${key}", []);
    const newItem: ${model.name} = {
      id: crypto.randomUUID(),
      ...form,${extraAssignments}
    };
    saveAll("${key}", [...existing, newItem]);
    router.back();
  }

  return (
    <main>
      <h1>${screen.name}</h1>
      <form onSubmit={handleSubmit}>
${inputs}
        <button type="submit">Save</button>
      </form>
    </main>
  );
}
`;

  return { path: screen.routeFile, contents };
}

function generateEditPage(
  screen: ScreenSpec,
  model: DataModelSpec,
  index: Map<string, ScreensForModel>
): ScaffoldFile {
  const key = storageKey(model);
  const seedName = `seed${pluralize(model.name)}`;
  const routeParams = dynamicSegments(screen.routePath);
  const ownIdParam = routeParams[routeParams.length - 1];
  const fields = formFields(model, routeParams);
  const fnName = pageFunctionName(screen.name, "Page");
  const listScreen = index.get(model.id)?.list;

  const inputs = fields
    .map((field) => {
      const type = htmlInputType(field.type);
      if (type === "checkbox") {
        return `        <label>
          ${field.name}
          <input
            type="checkbox"
            checked={Boolean(form?.${field.name})}
            onChange={(e) => setForm((f) => f && { ...f, ${field.name}: e.target.checked })}
          />
        </label>`;
      }
      const valueExpr = type === "number" ? "Number(e.target.value)" : "e.target.value";
      return `        <label>
          ${field.name}
          <input
            type="${type}"
            value={form?.${field.name} ?? ${type === "number" ? "0" : '""'}}
            onChange={(e) => setForm((f) => f && { ...f, ${field.name}: ${valueExpr} })}
          />
        </label>`;
    })
    .join("\n");

  const afterSaveRedirect = listScreen
    ? `router.push(${hrefTemplate(listScreen.routePath, `params.${ownIdParam}`)})`
    : "router.back()";

  const contents = `"use client";
// ${screen.name} — ${screen.purpose}
// Shown at ${screen.routePath}. Edit this file to change what this page does.

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAll, saveAll } from "@/lib/storage";
import { ${seedName} } from "@/lib/seedData";
import type { ${model.name} } from "@/models/types";

export default function ${fnName}() {
  const router = useRouter();
${paramsDeclaration(screen.routePath)}  const [form, setForm] = useState<${model.name} | undefined>();

  useEffect(() => {
    const all = getAll<${model.name}>("${key}", ${seedName});
    setForm(all.find((candidate) => candidate.id === params.${ownIdParam}));
  }, [params.${ownIdParam}]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    const all = getAll<${model.name}>("${key}", ${seedName});
    saveAll(
      "${key}",
      all.map((item) => (item.id === form.id ? form : item))
    );
    ${afterSaveRedirect};
  }

  function handleDelete() {
    if (!confirm("Delete this ${model.name.toLowerCase()}? This can't be undone.")) return;
    const all = getAll<${model.name}>("${key}", ${seedName});
    saveAll(
      "${key}",
      all.filter((item) => item.id !== params.${ownIdParam})
    );
    ${afterSaveRedirect};
  }

  if (!form) return <main><p>Loading...</p></main>;

  return (
    <main>
      <h1>${screen.name}</h1>
      <form onSubmit={handleSubmit}>
${inputs}
        <button type="submit">Save</button>
      </form>
      <button onClick={handleDelete}>Delete</button>
    </main>
  );
}
`;

  return { path: screen.routeFile, contents };
}

function generateGenericPage(screen: ScreenSpec): ScaffoldFile {
  const fnName = pageFunctionName(screen.name, "Page");
  const contents = `// ${screen.name} — ${screen.purpose}
// Shown at ${screen.routePath}. This screen is specific to your idea, so
// CodeMap can't generate its logic for you — this is a real starting point,
// not a finished screen. Check the project map's Issues tab for the task
// that covers building this out.

export default function ${fnName}() {
  return (
    <main>
      <h1>${screen.name}</h1>
      <p>${screen.purpose}</p>
      {/* TODO: build this screen. */}
    </main>
  );
}
`;
  return { path: screen.routeFile, contents };
}

/** Generate one real page file per screen. */
export function generatePages(
  screens: ScreenSpec[],
  components: ComponentSpec[],
  dataModels: DataModelSpec[]
): ScaffoldFile[] {
  const index = buildScreenIndex(screens, components, dataModels);

  return screens.map((screen) => {
    const kind = classifyScreen(screen);
    const model = kind === "generic" ? undefined : findModelForScreen(screen, components, dataModels);

    if (kind === "list" && model) return generateListPage(screen, model, index, dataModels);
    if (kind === "detail" && model) return generateDetailPage(screen, model, index, dataModels);
    if (kind === "create" && model) return generateCreatePage(screen, model, dataModels);
    if (kind === "edit" && model) return generateEditPage(screen, model, index);
    return generateGenericPage(screen);
  });
}

/** Generate one component file per component: a real display card for a "X Card" bound to one model, a small stub otherwise. */
export function generateComponentFiles(
  components: ComponentSpec[],
  dataModels: DataModelSpec[]
): ScaffoldFile[] {
  return components.map((component) => {
    const path = `components/${component.name}.tsx`;
    const model =
      component.dataModelIds.length === 1
        ? dataModels.find((m) => m.id === component.dataModelIds[0])
        : undefined;

    if (component.name.endsWith("Card") && model) {
      const fieldLines = model.fields
        .filter((field) => field.name !== "id" && !referencedModel(field, dataModels))
        .map((field) => `      <p>{item.${field.name}}</p>`)
        .join("\n");
      return {
        path,
        contents: `// ${component.name} — ${component.description}

import type { ${model.name} } from "@/models/types";

export function ${component.name}({ item }: { item: ${model.name} }) {
  return (
    <div className="card">
${fieldLines}
    </div>
  );
}
`,
      };
    }

    return {
      path,
      contents: `// ${component.name} — ${component.description}
// This is a starting point — CodeMap doesn't know exactly how you want this
// to look or behave yet. See the project map's Issues tab for the task that
// covers this component.

export function ${component.name}() {
  return <div>{/* TODO: ${component.description} */}</div>;
}
`,
    };
  });
}

export { classifyScreen, findModelForScreen };
export type { ScreenKind };
