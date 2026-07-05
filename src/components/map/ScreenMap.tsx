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
      {screens.map((screen) => (
        <Card key={screen.id}>
          <CardHeader>
            <CardTitle>{screen.name}</CardTitle>
            <CardDescription>{screen.purpose}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">{screen.routeFile}</p>
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
