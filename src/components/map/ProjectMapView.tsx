"use client";

import { DataModelPanel } from "@/components/map/DataModelPanel";
import { FileTreePreview } from "@/components/map/FileTreePreview";
import { IssueList } from "@/components/map/IssueList";
import { LearningNotesPanel } from "@/components/map/LearningNotesPanel";
import { OverviewPanel } from "@/components/map/OverviewPanel";
import { ReadmePreview } from "@/components/map/ReadmePreview";
import { ScreenMap } from "@/components/map/ScreenMap";
import { TaskSplitPanel } from "@/components/map/TaskSplitPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectMap } from "@/core/types";

export function ProjectMapView({ map }: { map: ProjectMap }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="screens">Screens</TabsTrigger>
        <TabsTrigger value="data">Data</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="issues">Issues & Milestones</TabsTrigger>
        <TabsTrigger value="readme">README</TabsTrigger>
        <TabsTrigger value="learning">Learning Notes</TabsTrigger>
        {map.taskSplit && <TabsTrigger value="team">Team Split</TabsTrigger>}
      </TabsList>

      <TabsContent value="overview" className="pt-4">
        <OverviewPanel map={map} />
      </TabsContent>
      <TabsContent value="screens" className="pt-4">
        <ScreenMap screens={map.screens} components={map.components} />
      </TabsContent>
      <TabsContent value="data" className="pt-4">
        <DataModelPanel dataModels={map.dataModels} />
      </TabsContent>
      <TabsContent value="files" className="pt-4">
        <FileTreePreview fileTree={map.fileTree} />
      </TabsContent>
      <TabsContent value="issues" className="pt-4">
        <IssueList issues={map.issues} milestones={map.milestones} />
      </TabsContent>
      <TabsContent value="readme" className="pt-4">
        <ReadmePreview readme={map.readme} />
      </TabsContent>
      <TabsContent value="learning" className="pt-4">
        <LearningNotesPanel learningNotes={map.learningNotes} />
      </TabsContent>
      {map.taskSplit && (
        <TabsContent value="team" className="pt-4">
          <TaskSplitPanel taskSplit={map.taskSplit} />
        </TabsContent>
      )}
    </Tabs>
  );
}
