"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BLOCK_DEFINITIONS } from "@/core/blocks";
import type { BlockId, ThingFieldType } from "@/core/types";

export interface ThingFieldDraft {
  name: string;
  type: ThingFieldType;
}

/** A thing being edited in the wizard. `key` is a stable client-side id — separate from the final ThingSpec.id, which is derived from the name when the spec is built. */
export interface ThingDraft {
  key: string;
  name: string;
  fields: ThingFieldDraft[];
  parentKey?: string;
  blockIds: BlockId[];
}

const FIELD_TYPES: { value: ThingFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Yes / No" },
  { value: "date", label: "Date" },
];

const BLOCK_ORDER: BlockId[] = ["list", "detail", "create", "edit-delete", "toggle", "stats"];

export function newThingDraft(key: string): ThingDraft {
  return {
    key,
    name: "",
    fields: [{ name: "", type: "text" }],
    blockIds: ["list", "detail", "create"],
  };
}

export function ThingsEditor({
  things,
  onChange,
}: {
  things: ThingDraft[];
  onChange: (things: ThingDraft[]) => void;
}) {
  function updateThing(key: string, patch: Partial<ThingDraft>) {
    onChange(things.map((thing) => (thing.key === key ? { ...thing, ...patch } : thing)));
  }

  function addThing() {
    onChange([...things, newThingDraft(Math.random().toString(36).slice(2))]);
  }

  function removeThing(key: string) {
    onChange(
      things
        .filter((thing) => thing.key !== key)
        .map((thing) => (thing.parentKey === key ? { ...thing, parentKey: undefined } : thing))
    );
  }

  function updateField(thingKey: string, index: number, patch: Partial<ThingFieldDraft>) {
    const thing = things.find((t) => t.key === thingKey);
    if (!thing) return;
    updateThing(thingKey, {
      fields: thing.fields.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    });
  }

  function addField(thingKey: string) {
    const thing = things.find((t) => t.key === thingKey);
    if (!thing) return;
    updateThing(thingKey, { fields: [...thing.fields, { name: "", type: "text" }] });
  }

  function removeField(thingKey: string, index: number) {
    const thing = things.find((t) => t.key === thingKey);
    if (!thing) return;
    updateThing(thingKey, { fields: thing.fields.filter((_, i) => i !== index) });
  }

  function toggleBlock(thingKey: string, block: BlockId, checked: boolean) {
    const thing = things.find((t) => t.key === thingKey);
    if (!thing) return;
    updateThing(thingKey, {
      blockIds: checked ? [...thing.blockIds, block] : thing.blockIds.filter((b) => b !== block),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Name the main things your app is about — a Deck, a Habit, an Event, a Recipe, whatever
        your idea needs — then pick what people should be able to do with each one.
      </p>

      {things.map((thing, index) => {
        const possibleParents = things.slice(0, index);
        const label = thing.name.trim() || "thing";

        return (
          <Card key={thing.key}>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor={`thing-name-${thing.key}`}>What's one of the main things in your app?</Label>
                <Input
                  id={`thing-name-${thing.key}`}
                  value={thing.name}
                  onChange={(event) => updateThing(thing.key, { name: event.target.value })}
                  placeholder="Deck, Habit, Event..."
                />
              </div>
              {things.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeThing(thing.key)}>
                  Remove
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>What details does a {label} have?</Label>
                {thing.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex items-center gap-2">
                    <Input
                      value={field.name}
                      onChange={(event) =>
                        updateField(thing.key, fieldIndex, { name: event.target.value })
                      }
                      placeholder="title, dueDate, location..."
                      className="flex-1"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        value && updateField(thing.key, fieldIndex, { type: value as ThingFieldType })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          {(value: string | null) =>
                            FIELD_TYPES.find((option) => option.value === value)?.label ?? "Type"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {thing.fields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeField(thing.key, fieldIndex)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="self-start" onClick={() => addField(thing.key)}>
                  Add a detail
                </Button>
              </div>

              {possibleParents.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <Label>Does each {label} belong to one of the things above?</Label>
                  <Select
                    value={thing.parentKey ?? "none"}
                    onValueChange={(value) =>
                      updateThing(thing.key, { parentKey: value && value !== "none" ? value : undefined })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string | null) => {
                          const parent = possibleParents.find((p) => p.key === value);
                          return parent
                            ? `Belongs to a ${parent.name.trim() || "thing"}`
                            : "No — it stands on its own";
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No — it stands on its own</SelectItem>
                      {possibleParents.map((parent) => (
                        <SelectItem key={parent.key} value={parent.key}>
                          Belongs to a {parent.name.trim() || "thing"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label>What should people be able to do with a {label}?</Label>
                {BLOCK_ORDER.map((block) => (
                  <label
                    key={block}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <Checkbox
                      checked={thing.blockIds.includes(block)}
                      onCheckedChange={(checked) => toggleBlock(thing.key, block, checked === true)}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{BLOCK_DEFINITIONS[block].label}</span>
                      <span className="text-sm text-muted-foreground">
                        {BLOCK_DEFINITIONS[block].description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button variant="outline" className="self-start" onClick={addThing}>
        Add another thing
      </Button>
    </div>
  );
}
