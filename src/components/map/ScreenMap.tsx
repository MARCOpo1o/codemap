import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ComponentSpec, ScreenSpec } from "@/core/types";

export function ScreenMap({
  screens,
  components,
}: {
  screens: ScreenSpec[];
  components: ComponentSpec[];
}) {
  const componentById = new Map(components.map((component) => [component.id, component]));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Each screen below is one page on your website. "File to edit" is the exact file you open
        to build it — save that file and refresh the page at that URL to see your change.
      </p>
      {screens.map((screen) => (
        <Card key={screen.id}>
          <CardHeader>
            <CardTitle>{screen.name}</CardTitle>
            <CardDescription>{screen.purpose}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Page URL:</span>{" "}
              <span className="font-mono">{screen.routePath}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">File to edit:</span>{" "}
              <span className="font-mono">{screen.routeFile}</span>
            </p>
            {screen.componentIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {screen.componentIds.map((componentId) => {
                  const component = componentById.get(componentId);
                  return (
                    <Badge key={componentId} variant="secondary">
                      {component?.name ?? componentId}
                    </Badge>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
