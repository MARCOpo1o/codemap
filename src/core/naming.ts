import type { StackId } from "./types";

export function toKebabCase(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "my-app";
}

export function pluralize(word: string): string {
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  return `${word}s`;
}

/**
 * Map a stack-neutral route path to the file that renders it.
 *
 *   "/decks/[deckId]/review"
 *     nextjs-web        -> "app/decks/[deckId]/review/page.tsx"
 *     expo-react-native -> "app/decks/[deckId]/review/index.tsx"
 *
 * Both routers are file-based with the same directory semantics; only the
 * leaf filename differs.
 */
export function routePathToFile(routePath: string, stack: StackId): string {
  const segments = routePath.split("/").filter(Boolean);
  const leaf = stack === "nextjs-web" ? "page.tsx" : "index.tsx";
  return ["app", ...segments, leaf].join("/");
}
