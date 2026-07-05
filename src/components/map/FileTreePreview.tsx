import { Folder, File } from "lucide-react";
import type { FileNode } from "@/core/types";

function FileTreeNode({ node, depth }: { node: FileNode; depth: number }) {
  return (
    <div>
      <div className="flex items-center gap-2 py-1" style={{ paddingLeft: depth * 16 }}>
        {node.type === "dir" ? (
          <Folder className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <File className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="font-mono text-sm">{node.name}</span>
        <span className="text-xs text-muted-foreground">— {node.explanation}</span>
      </div>
      {node.children?.map((child) => (
        <FileTreeNode key={`${depth}-${child.name}`} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function FileTreePreview({ fileTree }: { fileTree: FileNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <FileTreeNode node={fileTree} depth={0} />
    </div>
  );
}
