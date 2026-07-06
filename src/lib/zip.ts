import JSZip from "jszip";
import type { ScaffoldFile } from "@/core/types";

export async function downloadScaffoldZip(projectSlug: string, files: ScaffoldFile[]): Promise<void> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(`${projectSlug}/${file.path}`, file.contents);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectSlug}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
