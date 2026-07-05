import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LearningNote } from "@/core/types";

export function LearningNotesPanel({ learningNotes }: { learningNotes: LearningNote[] }) {
  return (
    <div className="flex flex-col gap-3">
      {learningNotes.map((note) => {
        const appearsIn = [
          ...note.appearsIn.screens.map((name) => `${name} screen`),
          ...note.appearsIn.components.map((name) => `${name} component`),
          ...note.appearsIn.issues,
          ...note.appearsIn.files,
        ];

        return (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle>{note.concept}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">{note.whyItMatters}</p>
              {appearsIn.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Shows up in: {appearsIn.join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
