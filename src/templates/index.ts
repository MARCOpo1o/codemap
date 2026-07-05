import { flashcardApp } from "./flashcardApp";
import { habitTracker } from "./habitTracker";
import type { ProjectTemplate } from "@/core/types";

/** Registry of all available project templates, keyed by id. */
export const templates: ProjectTemplate[] = [flashcardApp, habitTracker];

export function getTemplate(templateId: string): ProjectTemplate | undefined {
  return templates.find((template) => template.id === templateId);
}
