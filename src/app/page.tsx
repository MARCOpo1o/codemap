import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { templates } from "@/templates";

const STEPS = [
  {
    title: "Answer a few questions",
    body: "Name your project, pick a category, and describe the problem it solves and who it's for.",
  },
  {
    title: "Get a project map",
    body: "CodeMap generates screens, components, data models, a file tree, GitHub issues, and milestones — all connected to each other.",
  },
  {
    title: "Build with a plan",
    body: "Follow the milestones, work through the issues, and use the README draft to explain what you built.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-16 px-4 py-16">
      <section className="flex flex-col gap-4 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight">CodeMap</h1>
        <p className="text-xl text-muted-foreground">
          Turn an app idea into a structured project map: screens, components, data models,
          GitHub issues, milestones, and a README draft.
        </p>
        <p className="text-muted-foreground">
          Built for builders working on their first serious app project — student clubs,
          bootcamps, hackathon teams, and anyone learning to plan software before they build it.
        </p>
        <div className="flex justify-center sm:justify-start">
          <Button size="lg" nativeButton={false} render={<Link href="/builder" />}>
            Start a project map
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <CardDescription>Step {index + 1}</CardDescription>
                <CardTitle className="text-base">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Example presets — or describe your own idea</h2>
        <p className="text-sm text-muted-foreground">
          Presets are a fast starting point. If your idea doesn't match one, start from scratch
          instead — you'll name your own things and pick what people can do with each one.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/builder?mode=custom">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Start from scratch</CardTitle>
                <CardDescription>Describe your own idea — any app, any data.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          {templates.map((template) => (
            <Link key={template.id} href={`/builder?template=${template.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">{template.label}</CardTitle>
                  <CardDescription>{template.shortDescription}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
