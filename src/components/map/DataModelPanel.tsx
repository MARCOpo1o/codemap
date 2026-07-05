import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { DataModelSpec } from "@/core/types";

export function DataModelPanel({ dataModels }: { dataModels: DataModelSpec[] }) {
  return (
    <div className="flex flex-col gap-3">
      {dataModels.map((model) => (
        <Card key={model.id}>
          <CardHeader>
            <CardTitle>{model.name}</CardTitle>
            <CardDescription>{model.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {model.fields.map((field) => (
                  <tr key={field.name} className="border-t border-border">
                    <td className="py-1.5 pr-3 font-mono text-xs">{field.name}</td>
                    <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">
                      {field.type}
                    </td>
                    <td className="py-1.5 text-muted-foreground">{field.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
